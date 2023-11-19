import { EmailService } from '../email/email.service';
import { MeetingNoticeGateway } from 'src/meeting_notice/meeting_notice.gateway';
import { CronJob } from 'cron';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Injectable, HttpException, Inject, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { Booking } from './entities/booking.entity';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
@Injectable()
export class BookingService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private MeetingNoticeGateway: MeetingNoticeGateway,
    private EmailService: EmailService,
  ) {}

  private logger = new Logger();

  @Inject(JwtService)
  private JwtService: JwtService;

  @InjectEntityManager()
  private entityManager: EntityManager;

  @InjectRepository(Booking)
  private bookingRepository: Repository<Booking>;

  @InjectRepository(MeetingRoom)
  private meetingRoomRepository: Repository<MeetingRoom>;

  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: 1,
    });

    const user2 = await this.entityManager.findOneBy(User, {
      id: 2,
    });

    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 3,
    });
    const room2 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 6,
    });

    const booking1 = new Booking();
    booking1.room = room1;
    booking1.user = user1;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking1);

    const booking2 = new Booking();
    booking2.room = room2;
    booking2.user = user2;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking2);

    const booking3 = new Booking();
    booking3.room = room1;
    booking3.user = user2;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking3);

    const booking4 = new Booking();
    booking4.room = room2;
    booking4.user = user1;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking4);
  }

  async findHistory(userId: number) {
    const [history, count] = await this.bookingRepository.findAndCount({
      where: {
        user: {
          id: userId,
        },
      },
    });
    return {
      history,
      count,
    };
  }

  async bookingRoom(
    bookingData: {
      id: number;
      startTime: number;
      endTime: number;
      clientId: string;
    },
    Authorization: string,
  ) {
    const room = await this.meetingRoomRepository.findOne({
      where: {
        id: bookingData.id,
      },
    });
    const [, token] = Authorization.split(' ');
    const { userId } = await this.JwtService.verify(token);

    const user = await this.entityManager.findOne(User, {
      where: {
        id: userId,
      },
    });

    const booking = new Booking();
    booking.room = room;
    booking.user = user;
    booking.startTime = new Date(bookingData.startTime);
    booking.endTime = new Date(bookingData.endTime);
    try {
      await this.bookingRepository.insert(booking);
      await this.entityManager.update(MeetingRoom, booking.room.id, {
        ...booking.room,
        isBooked: true,
      });
      await this.notice(dayjs(booking.startTime), bookingData.clientId, user);
    } catch (error) {
      throw new HttpException('预定失败', 200);
    }

    return '预定成功';
  }

  async findUserBooking(userId: number) {
    const userBooking = await this.entityManager.find(Booking, {
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
        room: true,
      },
      order: {
        createTime: 'DESC',
      },
    });

    return { userBooking };
  }

  async cancel(cancelData: { id: number }) {
    await this.bookingRepository.delete({
      id: cancelData.id,
    });
    return 'success';
  }

  async notice(date: dayjs.Dayjs, clientId: string, user: User) {
    const job = new CronJob(
      new Date(date.subtract(5, 'minutes').valueOf()),
      async () => {
        this.MeetingNoticeGateway.sentMessage(clientId, '会议开始通知');
        this.logger.log('会议开始通知已发出');
        await this.EmailService.sendMail({
          to: user.email,
          subject: '会议室马上开始',
          html: `<p>会议室开始提醒</p>`,
        });
      },
    );
    this.schedulerRegistry.addCronJob('meetingStartNotice', job);
    job.start();
  }
}
