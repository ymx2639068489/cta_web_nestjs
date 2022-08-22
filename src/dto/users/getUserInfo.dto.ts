import { PickType } from "@nestjs/swagger";
import { AllUserDto } from './all-user.dto';
export class getUserInfoDto extends PickType(AllUserDto, [
  'username',
  'studentId',
  'college',
  'major',
  'class',
  'qq',
  'avatarUrl'
]) {}
