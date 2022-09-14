import { UserDto } from '../users';
import { ApiProperty } from '@nestjs/swagger';
export class journalism {
  @ApiProperty()
  id: number;

  @ApiProperty({ description: '作者' })
  author: UserDto;
}