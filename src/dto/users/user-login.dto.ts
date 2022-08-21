import { PickType } from "@nestjs/swagger";
import { AllUserDto } from "./all-user.dto";

export class UserLoginDto extends PickType(AllUserDto, [
  'studentId',
  'password',
]) {}
