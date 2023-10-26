import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

//  Service 是可以被注入也是可以注入到别的对象的，所以用 @Injectable 声明。
@Injectable()
export class AppService {
  async getHello() {
    return 'hello world';
  }
}
