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
const util = require('util');
type KeyValue = {
  channels?: Object;
  [key: string]: any;
};
type EnhanceSocker = Socket & KeyValue;

const channels = {};
const sockets = {};
const peers = {};
const options = { depth: null, colors: true };

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleDisconnect(client: Socket) {
    // throw new Error('Method not implemented.');
  }
  handleConnection(socket: EnhanceSocker) {
    const socketHostName = socket.handshake.headers.host.split(':')[0];

    socket.channels = {};
    sockets[socket.id] = socket;

    console.log('[' + socket.id + '] connection accepted');
    socket.on('disconnect', () => {
      for (const channel in socket.channels) {
        part(channel);
      }
      console.log('[' + socket.id + '] disconnected');
      delete sockets[socket.id];
    });

    socket.on('join', (config) => {
      console.log('[' + socket.id + '] join ', config);
      const channel = socketHostName + config.channel;
      // Already Joined
      if (channel in socket.channels) return;

      if (!(channel in channels)) {
        channels[channel] = {};
      }

      if (!(channel in peers)) {
        peers[channel] = {};
      }

      peers[channel][socket.id] = {
        userData: config.userData,
      };

      console.log(
        '[' + socket.id + '] join - connected peers grouped by channel',
        util.inspect(peers, options),
      );

      for (const id in channels[channel]) {
        channels[channel][id].emit('addPeer', {
          peer_id: socket.id,
          should_create_offer: false,
          channel: peers[channel],
        });
        socket.emit('addPeer', {
          peer_id: id,
          should_create_offer: true,
          channel: peers[channel],
        });
      }

      channels[channel][socket.id] = socket;
      socket.channels[channel] = channel;
    });

    socket.on('updateUserData', async (config) => {
      const channel = socketHostName + config.channel;
      const key = config.key;
      const value = config.value;
      for (const id in peers[channel]) {
        if (id == socket.id) {
          peers[channel][id]['userData'][key] = value;
        }
      }
      console.log(
        '[' + socket.id + '] updateUserData',
        util.inspect(peers[channel][socket.id], options),
      );
    });

    const part = (channel) => {
      // Socket not in channel
      if (!(channel in socket.channels)) return;

      delete socket.channels[channel];
      delete channels[channel][socket.id];

      delete peers[channel][socket.id];
      if (Object.keys(peers[channel]).length == 0) {
        // last peer disconnected from the channel
        delete peers[channel];
      }
      console.log(
        '[' + socket.id + '] part - connected peers grouped by channel',
        util.inspect(peers, options),
      );

      for (const id in channels[channel]) {
        channels[channel][id].emit('removePeer', { peer_id: socket.id });
        socket.emit('removePeer', { peer_id: id });
      }
    };

    socket.on('relayICECandidate', (config) => {
      const peer_id = config.peer_id;
      const ice_candidate = config.ice_candidate;

      if (peer_id in sockets) {
        sockets[peer_id].emit('iceCandidate', {
          peer_id: socket.id,
          ice_candidate: ice_candidate,
        });
      }
    });

    socket.on('relaySessionDescription', (config) => {
      const peer_id = config.peer_id;
      const session_description = config.session_description;

      if (peer_id in sockets) {
        sockets[peer_id].emit('sessionDescription', {
          peer_id: socket.id,
          session_description: session_description,
        });
      }
    });
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
