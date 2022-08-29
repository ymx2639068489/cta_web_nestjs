import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { UserDto } from '../users';
export class AllMessageDto {
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @ApiProperty({ description: '谁发的'})
  from: UserDto;

  @IsNotEmpty()
  @ApiProperty({ description: '发给谁'})
  to: UserDto;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '内容是什么'})
  content: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ description: '是否需要确定' })
  isNeedToConfirm: boolean;

  @IsBoolean()
  @ApiProperty({ description: '是否已经确定' })
  isConfirm: boolean;
  
  @IsString()
  @ApiProperty({ description: '确定后需要的回调函数'})
  callback: string;

  @IsBoolean()
  @ApiProperty({ description: '是否已读' })
  isRead: boolean;
}