import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class UserLoginDto {
  // 学号
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '+学号', example: '20101010110' })
  studentId: string;
  // 密码
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '+密码', example: '123456' })
  password: string;
}
