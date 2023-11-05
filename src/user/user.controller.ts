import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUser } from './dto/register-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  create(@Body() registerUser: RegisterUser) {
    console.log(registerUser);
    return 'success';
  }
}
