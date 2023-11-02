import {
  Controller,
  Get,
  Inject,
  Res,
  Session,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
// Controller 只需要被注入
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(ConfigService)
  private configService: ConfigService;

  @Get()
  async getHello(): Promise<Object> {
    return {
      aaa: this.configService.get('aaa'),
      bbb: this.configService.get('bbb'),
    };
  }
}
