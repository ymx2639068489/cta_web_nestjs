import { GxaDto } from './allGxa.dto';
import { PartialType, PickType } from '@nestjs/swagger';


export class CreateApplicationFormDto extends PartialType(
  class extends PickType(GxaDto, ['teamName']) {}
) {}
