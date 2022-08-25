import { ApiProperty, PickType } from "@nestjs/swagger";
import { AllUserDto } from './all-user.dto';
export class getUserInfoDto extends PickType(AllUserDto, [
  'username',
  'studentId',
  'college',
  'major',
  'class',
  'qq',
  'avatarUrl',
]) {
  @ApiProperty({ description: '社团身份', example: [20]})
  roles: number[];
}
