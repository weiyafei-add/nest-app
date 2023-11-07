import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redis_client: RedisClientType;

  async get(key: string) {
    return await this.redis_client.get(key);
  }

  async set(key: string, value: string | number, ttl?: number) {
    await this.redis_client.set(key, value);

    if (ttl) {
      await this.redis_client.expire(key, ttl);
    }
  }
}
