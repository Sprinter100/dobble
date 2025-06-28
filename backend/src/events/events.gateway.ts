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
import { AuthService } from '../auth/auth.service';

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

  constructor(private readonly authService: AuthService) {
    game.on('playerUnblocked', this.handlePlayerUnblocked);
    game.on('stateChange', this.handleStateChange);
  }

  afterInit() {
    this.logger.log('Initialized');
  }

  getClientId(client: Socket): string {
    const cookiesArr = (client.handshake.headers.cookie || '').split(';');
    const cookies = cookiesArr.reduce((acc, cur) => {
      const [key, value] = cur.split('=');
      acc[(key || '').trim()] = (value || '').trim();
      return acc;
    }, {});

    // Try to get session ID from cookies
    const sessionId = cookies['connect.sid'] as string;

    if (sessionId) {
      // Get user from session
      const session = this.authService.getSession(sessionId);
      if (session) {
        return session.userId;
      }
    }

    // Fallback to device_id for anonymous users
    const deviceId = cookies['device_id'] as string;
    return deviceId || client.id;
  }

  getClientUsername(client: Socket): string {
    const cookiesArr = (client.handshake.headers.cookie || '').split(';');
    const cookies = cookiesArr.reduce((acc, cur) => {
      const [key, value] = cur.split('=');
      acc[(key || '').trim()] = (value || '').trim();
      return acc;
    }, {});

    const sessionId = cookies['connect.sid'] as string;

    if (sessionId) {
      const session = this.authService.getSession(sessionId);
      if (session) {
        return session.username;
      }
    }

    return `Player ${client.id.slice(0, 6)}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    const { sockets } = this.server.sockets;
    const clientId = this.getClientId(client);
    const username = this.getClientUsername(client);

    game.addPlayer(clientId);

    // Update player name if authenticated
    const player = game.findPlayerById(clientId);
    if (player) {
      player.name = username;
    }

    this.server.emit('gameState', game.getState());

    this.logger.log(`Client id: ${clientId} (${username}) connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const clientId = this.getClientId(client);
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
  move(@ConnectedSocket() client: Socket) {
    const clientId = this.getClientId(client);
    const username = this.getClientUsername(client);

    this.server.emit('playerMove', `${username} moved!`);
    return game.move(clientId);
  }

  @SubscribeMessage('playerReady')
  ready(@ConnectedSocket() client: Socket) {
    const clientId = this.getClientId(client);
    return game.playerReady(clientId);
  }

  handlePlayerUnblocked = () => {
    this.server.emit('handlePlayerUnblocked');
  };

  handleStateChange = (data) => {
    this.server.emit('stateChange', data);
  };
}
