import { Module } from '@nestjs/common';
import { BbbService } from './bbb.service';
import { BbbController } from './bbb.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [BbbController],
  providers: [BbbService],
})
export class BbbModule {}
