import { UserDto } from '../users';
import { ApiProperty } from '@nestjs/swagger';
export class journalism {
  @ApiProperty()
  id: number;

  @ApiProperty({ description: '作者' })
  author: UserDto;

  @ApiProperty({ description: '标题' })
  titla: string;

  @ApiProperty({ description: '内容' })
  content: string;
  
  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}