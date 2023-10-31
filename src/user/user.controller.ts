import {
  Controller,
  Post,
  Body,
  Inject,
  Res,
  UseGuards,
  Get,
  ValidationPipe,
  Session,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginGuard } from 'src/login.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Post('login')
  async login(@Body() loginUser: LoginDto, @Session() session) {
    const user = await this.userService.login(loginUser);

    const access_token = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
      },
      {
        expiresIn: '30m',
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        expiresIn: '7d',
      },
    );

    session.user = {
      username: user.username,
    };

    return {
      access_token,
      refresh_token,
    };
  }

  @Post('register')
  async register(@Body() user: RegisterDto) {
    return await this.userService.register(user);
  }

  @Get('init')
  async init() {
    await this.userService.initData();
    return 'done';
  }
}
