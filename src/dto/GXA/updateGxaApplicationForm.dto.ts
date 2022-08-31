import { GxaDto } from '.';
import { PartialType, PickType } from '@nestjs/swagger';

export class UpdateGxaApplicationFormDto extends PartialType(
  class temp extends PickType(GxaDto, [
    'workName',
    'teamName',
    'group',
    'teamMemberSpecialty',
    'introductionToWorks'
  ]) {}
) {}
