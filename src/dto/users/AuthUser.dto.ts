import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { AllUserDto } from "./all-user.dto";
import { CreateUserIdentityDto } from "./user-identity.dto";

class temp extends PickType(AllUserDto, [
  'studentId',
  'qq',
  'college',
  'major',
  'class',
  'username',
  'avatarUrl',
]) {
  iat?: any;
  exp?: any;
  // id
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'id', example: '6' })
  id: number;
  @ApiProperty({ description: '社团身份', example: [20]})
  roles: number[];
}
export class AuthUserDto extends PartialType(temp) {}
