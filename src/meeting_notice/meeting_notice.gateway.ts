import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const clients = {} as Record<string, Socket>;

@WebSocketGateway(3636)
export class MeetingNoticeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    clients[client.id] = client;
    console.log(client.id);
  }

  sentMessage(clientId: string, message: string) {
    clients[clientId].emit('notice');
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
