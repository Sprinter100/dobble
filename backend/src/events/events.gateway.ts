import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { game } from './game';
import { Logger } from '@nestjs/common';
import { sessionMiddleware } from 'src/middlewares/session';
import * as passport from 'passport';
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor() {
    game.on('gameState', this.handleGameState);

    game.init();
  }

  afterInit() {
    this.server.engine.use(sessionMiddleware);
    this.server.engine.use(passport.session());
    this.logger.log('Initialized');
  }

  getClientId(user: Express.User): string {
    return user.id;
  }

  getClientUsername(user: Express.User): string {
    return user.username;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    const user = client.request.user;

    if (!user) {
      client.disconnect();

      return;
    }

    const { sockets } = this.server.sockets;
    const clientId = this.getClientId(user);
    const username = this.getClientUsername(user);

    const player = game.addPlayer(clientId);

    if (player) {
      player.name = username;
    }

    this.server.emit('gameState', game.getState());
    client.emit('clientId', clientId);
    this.logger.log(`Client id: ${clientId} (${username}) connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const user = client.request.user;

    if (!user) {
      return;
    }

    const clientId = this.getClientId(user);
    game.removePlayer(clientId);
    this.logger.log(`Client id: ${clientId} disconnected`);
  }

  @SubscribeMessage('events')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return Promise.resolve(data);
  }

  @SubscribeMessage('move')
  move(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const user = client.request.user;

    if (!user) {
      client.disconnect();

      return;
    }

    const clientId = this.getClientId(user);
    const username = this.getClientUsername(user);

    this.server.emit('playerMove', `${username} moved!`);
    return game.move(clientId, data);
  }

  @SubscribeMessage('playerReady')
  ready(@ConnectedSocket() client: Socket) {
    const user = client.request.user;

    if (!user) {
      client.disconnect();

      return;
    }

    const clientId = this.getClientId(user);
    return game.playerReady(clientId);
  }

  handleGameState = (data) => {
    this.server.emit('gameState', data);
  };
}
