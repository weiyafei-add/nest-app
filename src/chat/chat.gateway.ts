import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
type KeyValue = {
  channels?: Object;
  [key: string]: any;
};
type EnhanceSocker = Socket & KeyValue;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleDisconnect(client: Socket) {
    // throw new Error('Method not implemented.');
  }
  handleConnection(socket: EnhanceSocker) {
    const socketHostName = socket.handshake.headers.host.split(':')[0];

    socket.channels = {};
    socket[socket.id] = socket;

    console.log(`${socket.id} 连接已被接受`);

    socket.on('disconnect', () => {
      for (const channel in socket.channels) {
        part(channel);
      }
    });

    socket.on('join', (config) => {});

    socket.on('updateUserData', async (config) => {});

    socket.on('relayICECandidate', (config) => {});
    socket.on('relaySessionDescription', (config) => {});

    const part = (channel: any) => {
      if (!(channel in socket.channels)) return;

      delete socket.channels[channel];
    };
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('收到信息;', data);
    this.server.emit('message', data);
    this.server.emit('123', data);
  }
}
