import { PartialType, PickType } from '@nestjs/swagger';
import { AllUserDto } from './all-user.dto';
class updateUser extends PickType(AllUserDto, [
  'username',
  'password',
  'college',
  'major',
  'class',
  'qq',
  'phoneNumber',
  'avatarUrl'
]) {}

export class UpdateUserDto extends PartialType(updateUser) {}

