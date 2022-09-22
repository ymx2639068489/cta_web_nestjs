import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { journalism } from './AllJournalism.dto';

export class GetJournalismListDto extends PickType(journalism, [
  'id',
  'titla',
  'updatedAt'
]) {}
export class GetJournalismDetailDto extends PickType(journalism, [
  'id',
  'titla',
  'content',
  'updatedAt'
]) {
  @ApiProperty({ description: '作者' })
  @IsNotEmpty()
  @IsString()
  author: string;
}

