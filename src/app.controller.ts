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
import { UserService } from './user/user.service';
import { ConfigService } from '@nestjs/config';

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

  @Inject(UserService)
  private userService: UserService;

  @Inject(ConfigService)
  private configService:ConfigService 

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
      `https://116.204.21.112/end/pages/confirm.html?id=${uuid}`,
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
  async check(@Query('id') id: string, @Query('userId') userId: number) {
    console.log(map)
    const info = map.get(`qrcode_${id}`);
    if (info.status === 'scan-confirm') {
      const user =  await this.userService.findUserById(userId, false);
      
      const vo =  await this.userService.login({username: user.username, password: user.password}, false, true) as any
      
      
      vo.accessToken = this.jwtService.sign(
        {
          userId: vo.userInfo.id,
          username: vo.userInfo.username,
          roules: vo.userInfo.roles,
          permission: vo.userInfo.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );
  
      vo.refreshToken = this.jwtService.sign(
        {
          userId: vo.userInfo.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );
  
      return {...vo, status: 'scan-confirm'};
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
