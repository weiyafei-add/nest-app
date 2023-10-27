import { PartialType } from '@nestjs/mapped-types';
import { CreateRbacUserDto } from './create-rbac_user.dto';

export class UpdateRbacUserDto extends PartialType(CreateRbacUserDto) {}
