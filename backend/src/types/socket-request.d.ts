import 'socket.io';

declare module 'http' {
  interface IncomingMessage {
    user?: Express.User;
  }
}
