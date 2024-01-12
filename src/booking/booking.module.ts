import { Global, Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { MeetingNoticeGateway } from 'src/meeting_notice/meeting_notice.gateway';
import { EmailService } from 'src/email/email.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Booking, MeetingRoom])],
  controllers: [BookingController],
  providers: [BookingService, MeetingNoticeGateway, EmailService],
  exports: [BookingService]
})
export class BookingModule {}
