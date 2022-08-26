import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { AllUserDto } from "./all-user.dto";
import { CreateUserIdentityDto } from "./user-identity.dto";

class temp {
  iat?: any;
  exp?: any;
  // id
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'id', example: '6' })
  id: number;
}
export class AuthUserDto extends PartialType(temp) {}
