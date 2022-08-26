import { GxaDto } from './allGxa.dto';
import { PartialType, PickType } from '@nestjs/swagger';

class temp extends PickType(GxaDto, [
  'workName',
  'teamName',
  'group',
  'teamMumberSpecialty',
  'introductionToWorks'
]) {}
export class createApplicationFormDto extends PartialType(temp) {}
