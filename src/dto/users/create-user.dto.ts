import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Result } from '../../common/interface/result';
export class CreateUserDto {
  // 姓名
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '姓名', example: '张三' })
  username: string;
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
  // 学院
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '学院', example: '计算机科学与工程学院' })
  college: string;
  // 专业
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '专业', example: '软件工程' })
  major: string;
  // 班级
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '班级', example: '20204' })
  class: string;
  // QQ
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '+QQ', example: '2639068689' })
  qq: string;
}
