import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Like, Repository, EntityManager } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { BookingService } from 'src/booking/booking.service';

@Injectable()
export class MeetingRoomService {

  @InjectEntityManager()
  private EntityManager: EntityManager;
  
  @InjectRepository(MeetingRoom)
  private meetingRoomRepository: Repository<MeetingRoom>;

  @Inject(BookingService)
  private bookingService: BookingService

  initData() {
    const room1 = new MeetingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '一层西';

    const room2 = new MeetingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '二层东';

    const room3 = new MeetingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '三层东';

    this.meetingRoomRepository.save([room1, room2, room3]);
  }

  async find({ pageNo, pageSize, name, capacity, equipment, location }) {
    if (pageNo < 1) {
      throw new BadRequestException('页码最小为1');
    }

    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string, any> = {};

    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }
    if (capacity) {
      condition.capacity = capacity;
    }
    if (location) {
      condition.location = location;
    }

    const [meetingRooms, totalCount] =
      await this.meetingRoomRepository.findAndCount({
        skip: skipCount,
        take: pageSize,
        where: condition,
      });

    return {
      meetingRooms,
      totalCount,
    };
  }

  async create(meetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.meetingRoomRepository.findOneBy({
      name: meetingRoomDto.name,
    });

    if (room) {
      throw new BadRequestException('会议室名字已存在');
    }
    return await this.meetingRoomRepository.insert(meetingRoomDto);
  }

  async update(meetingRoomDto: UpdateMeetingRoomDto) {
    const meetingRoom = await this.meetingRoomRepository.findOneBy({
      id: meetingRoomDto.id,
    });

    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    meetingRoom.capacity = meetingRoomDto.capacity;
    meetingRoom.location = meetingRoomDto.location;
    meetingRoom.name = meetingRoomDto.name;

    if (meetingRoomDto.description) {
      meetingRoom.description = meetingRoomDto.description;
    }
    if (meetingRoomDto.equipment) {
      meetingRoom.equipment = meetingRoomDto.equipment;
    }

    await this.meetingRoomRepository.update(
      {
        id: meetingRoom.id,
      },
      meetingRoom,
    );

    return 'success';
  }

  async delete(id: number) {
    await this.meetingRoomRepository.delete({
      id,
    });
    return 'success';
  }

  async free(id: number) {
    const meetingRoom = await this.meetingRoomRepository.findOneBy({
      id: id,
    });
    const bookingData = await this.EntityManager.findOne(Booking, {
      where: {
        room: {
          id: meetingRoom.id,
        }
      },
      relations: {
        room: true
      }
    })

    await this.bookingService.cancel({id: bookingData.id});
    // meetingRoom.isBooked = false;
    // await this.meetingRoomRepository.save(meetingRoom);
    return 'success';
  }
}
