import { Module } from '@nestjs/common';
import { RbacUserService } from './rbac_user.service';
import { RbacUserController } from './rbac_user.controller';

@Module({
  controllers: [RbacUserController],
  providers: [RbacUserService],
  exports: [RbacUserService],
})
export class RbacUserModule {}
