import { PartialType } from '@nestjs/swagger';
import { AllUserDto } from './all-user.dto';

export class UpdateUserDto extends PartialType(AllUserDto) {}
