import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  headPic: string;

  nickName: string;
}
