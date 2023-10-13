import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
    <!DOCTYPE html>
<html>
  <body>
    <script>
      const socket = new WebSocket('ws://localhost:3000');

      socket.addEventListener('open', (event) => {
        console.log('Connected to WebSocket server');
        socket.send('Hello, server!');
      });

      socket.addEventListener('message', (event) => {
        console.log('Message from server:', event.data);
      });
    </script>
  </body>
</html>
    `;
  }
}
