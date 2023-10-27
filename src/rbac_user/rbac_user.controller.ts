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
    const token = this.jwtService.sign({
      user: {
        username: user.username,
        rules: user.roles,
      },
    });
    return {
      token,
    };
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
