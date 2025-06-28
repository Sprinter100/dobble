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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor() {
    game.on('playerUnblocked', this.handlePlayerUnblocked);
    game.on('stateChange', this.handleStateChange);
  }

  afterInit() {
    this.logger.log('Initialized');
  }

  getClientId(client: Socket) {
    const cookiesArr = (client.handshake.headers.cookie || '').split(';');
    const cookies = cookiesArr.reduce((acc, cur) => {
      const [key, value] = cur.split('=');
      acc[(key || '').trim()] = (value || '').trim();

      return acc;
    }, {});

    const id = cookies['device_id'] as string;

    return id;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    const { sockets } = this.server.sockets;

    game.addPlayer(this.getClientId(client));
    this.server.emit('gameState', game.getState());

    this.logger.log(`Client id: ${this.getClientId(client)} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    game.removePlayer(this.getClientId(client));
    this.logger.log(`Cliend id:${this.getClientId(client)} disconnected`);
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
  move(@ConnectedSocket() client: Socket) {
    this.server.emit('playerMove', `Player ${this.getClientId(client)} Moved!`);
    return game.move(this.getClientId(client));
  }

  @SubscribeMessage('playerReady')
  ready(@ConnectedSocket() client: Socket) {
    // this.server.emit('playerMove', `Player ${this.getClientId(client)} Moved!`);
    return game.playerReady(this.getClientId(client));
  }

  handlePlayerUnblocked = () => {
    this.server.emit('handlePlayerUnblocked');
  };

  handleStateChange = (data) => {
    this.server.emit('stateChange', data);
  };
}
