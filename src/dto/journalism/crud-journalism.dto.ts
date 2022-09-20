import { PickType } from '@nestjs/swagger';
import { journalism } from './AllJournalism.dto';

export class GetJournalismListDto extends PickType(journalism, [
  'id',
  'titla',
  'updatedAt'
]) {}
