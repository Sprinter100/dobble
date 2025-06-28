import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SessionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: number; userId: number },
  ) {
    await client.join(`session-${data.sessionId}`);
    console.log(`User ${data.userId} joined room: session-${data.sessionId}`);

    // Notify everyone in the room
    this.server.to(`session-${data.sessionId}`).emit('userJoined', {
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: number; userId: number },
  ) {
    await client.leave(`session-${data.sessionId}`);
    console.log(`User ${data.userId} left room: session-${data.sessionId}`);

    // Notify everyone in the room
    this.server.to(`session-${data.sessionId}`).emit('userLeft', {
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: number; userId: number; message: string },
  ) {
    console.log(
      `Message in session ${data.sessionId} from user ${data.userId}: ${data.message}`,
    );

    // Broadcast message to everyone in the room
    this.server.to(`session-${data.sessionId}`).emit('newMessage', {
      userId: data.userId,
      sessionId: data.sessionId,
      message: data.message,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('gameAction')
  handleGameAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: number; userId: number; action: any },
  ) {
    console.log(
      `Game action in session ${data.sessionId} from user ${data.userId}:`,
      data.action,
    );

    // Broadcast game action to everyone in the room
    this.server.to(`session-${data.sessionId}`).emit('gameUpdate', {
      userId: data.userId,
      sessionId: data.sessionId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      action: data.action,
      timestamp: new Date(),
    });

    return { success: true };
  }
}
