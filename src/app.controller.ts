import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Inject,
  Query,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { AppService } from './app.service';
import { randomUUID } from 'crypto';
import * as qrcode from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import { RequireLogin, RequirePermission, UserInfo } from './custom.decorator';

interface QrCodeInfo {
  status:
    | 'noscan'
    | 'scan-wait-confitm'
    | 'scan-confirm'
    | 'scan-cancel'
    | 'expired';
  userInfo?: {
    userId: number;
  };
}

const map = new Map<string, QrCodeInfo>();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Get('aaa')
  @RequireLogin()
  @RequirePermission('ddd')
  aaa(@UserInfo('username') username: string, @UserInfo() userinfo): string {
    console.log(username, userinfo);
    return 'aaa';
  }

  @Get('bbb')
  bbb(): string {
    return 'bbb';
  }

  private users = [
    { id: 1, username: 'feifei', password: '123' },
    { id: 2, username: 'qiqi', password: '456' },
  ];

  @Get('login')
  async login(
    @Query('username') username: string,
    @Query('password') password: string,
  ) {
    const user = this.users.find((item) => item.username === username);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (password !== user.password) {
      throw new UnauthorizedException('密码错误');
    }

    return this.jwtService.sign({
      userId: user.id,
    });
  }

  @Get('userinfo')
  async userinfo(@Headers('Authorization') auth: string) {
    try {
      const [, token] = auth.split(' ');
      const info = await this.jwtService.verify(token);
      const user = this.users.find((item) => item.id == info.userId);
      return user;
    } catch (error) {
      throw new UnauthorizedException('token 过期，请重新登录');
    }
  }

  @Get('qrcode/generate')
  async generate() {
    const uuid = randomUUID();
    const dataUrl = await qrcode.toDataURL(
      `http://192.168.3.136:3000/pages/confirm.html?id=${uuid}`,
    );

    map.set(`qrcode_${uuid}`, {
      status: 'noscan',
    });

    return {
      qrcode_id: uuid,
      img: dataUrl,
    };
  }

  @Get('qrcode/check')
  async check(@Query('id') id: string) {
    const info = map.get(`qrcode_${id}`);
    if (info.status === 'scan-confirm') {
      return {
        token: this.jwtService.sign({
          userId: info.userInfo.userId,
        }),
        ...info,
      };
    }
    return info;
  }

  @Get('qrcode/scan')
  async scan(@Query('id') id: string) {
    const info = map.get(`qrcode_${id}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }
    info.status = 'scan-wait-confitm';
    return 'success';
  }

  @Get('qrcode/confirm')
  async confirm(
    @Query('id') id: string,
    @Headers('Authorization') auth: string,
  ) {
    let user;
    try {
      const [, token] = auth.split(' ');
      const info = await this.jwtService.verify(token);
      console.log(info.userId);
      user = this.users.find((item) => item.id == info.userId);
    } catch (error) {}

    const info = map.get(`qrcode_${id}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }
    console.log(user);
    info.status = 'scan-confirm';
    info.userInfo = user;
    return 'success';
  }

  @Get('qrcode/cancel')
  async cancel(@Query('id') id: string) {
    const info = map.get(`qrcode_${id}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }
    info.status = 'scan-cancel';
    return 'success';
  }
}
