import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  Inject,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { RbacUserService } from './rbac_user.service';
import { CreateRbacUserDto } from './dto/create-rbac_user.dto';
import { UpdateRbacUserDto } from './dto/update-rbac_user.dto';
import { LoginDto } from 'src/user/dto/login.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Controller('rbac-user')
export class RbacUserController {
  constructor(private readonly rbacUserService: RbacUserService) {}

  @InjectEntityManager()
  intityManager: EntityManager;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Post()
  create(@Body() createRbacUserDto: CreateRbacUserDto) {
    return this.rbacUserService.create(createRbacUserDto);
  }

  @Get('init')
  async init() {
    await this.rbacUserService.initData();
    return 'done';
  }

  @Post('login')
  async login(@Body() loginUser: LoginDto) {
    const user = await this.rbacUserService.login(loginUser);
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
    return {
      access_token,
      refresh_token,
    };
  }

  @Get('refresh_token')
  async refresh(@Query('refresh_token') refreshToken: string) {
    console.log(refreshToken);
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.rbacUserService.findUserById(data.userId);
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

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @Get()
  findAll() {
    return this.rbacUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rbacUserService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRbacUserDto: UpdateRbacUserDto,
  ) {
    return this.rbacUserService.update(+id, updateRbacUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rbacUserService.remove(+id);
  }
}
