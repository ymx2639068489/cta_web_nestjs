import { User } from '@/entities/users';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AllMessageDto {
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @ApiProperty({ description: '谁发的'})
  from: User;

  @IsNotEmpty()
  @ApiProperty({ description: '发给谁'})
  to: User;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '内容是什么'})
  content: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isNeedToConfirm: boolean;

  @ApiProperty()
  isConfirm: boolean;
  
  @IsString()
  @ApiProperty()
  callback: string;
}