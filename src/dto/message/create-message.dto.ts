import { PickType } from "@nestjs/swagger";
import { AllMessageDto } from './allMessage.dto';
export class CreateMessageDto extends PickType(AllMessageDto, [
  'from',
  'to',
  'content',
  'isNeedToConfirm',
  'callback'
]) {}