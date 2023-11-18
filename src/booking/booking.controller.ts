import * as dayjs from 'dayjs';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  Headers,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { generateParseIntPipe } from 'src/utils/util';
import { RequireLogin, UserInfo } from 'src/custom.decorator';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('history')
  @RequireLogin()
  getBookingHistory(@UserInfo('userId') userId: number) {
    return this.bookingService.findHistory(userId);
  }

  @Post('room')
  @RequireLogin()
  booking(
    @Body()
    bookingData: {
      id: number;
      startTime: number;
      endTime: number;
      clientId: string;
    },
    @Headers('Authorization') Authorization: string,
  ) {
    return this.bookingService.bookingRoom(bookingData, Authorization);
  }

  @Get('myBooking')
  @RequireLogin()
  getMyBooking(@UserInfo('userId') userId: number) {
    return this.bookingService.findUserBooking(userId);
  }

  @Post('cancel')
  @RequireLogin()
  cancelBooking(@Body() cancelData: { id: number }) {
    return this.bookingService.cancel(cancelData);
  }
}
