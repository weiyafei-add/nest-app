import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ChatGateway } from './chat/chat.gateway';
// import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { createClient } from 'redis';
import { JwtModule } from '@nestjs/jwt';
// import { UserController } from './user/user.controller';
// import { UserService } from './user/user.service';
// import { BbbModule } from './bbb/bbb.module';
// import { RedisModule } from './redis/redis.module';
import { RbacUserModule } from './rbac_user/rbac_user.module';
import { User } from './rbac_user/entities/rbac_user.entity';
import { Role } from './rbac_user/entities/role.entity';
import { Permission } from './rbac_user/entities/permission.entity';
import { APP_GUARD } from '@nestjs/core';
import { LoginGuard } from './login.guard';
import { PermissionGuard } from './permission.guard';
// useFactory 注入支持异步：
// 用 useFactory 根据传入的 options 动态创建数据库连接对象：

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '192.168.3.136',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'rbac_test',
      synchronize: true,
      logging: true,
      entities: [User, Role, Permission],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugin: 'sha256_password',
      },
    }),
    JwtModule.register({
      global: true,
      secret: 'fei',
      signOptions: {
        expiresIn: '30m',
      },
    }),
    RbacUserModule,
    // BbbModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
