import { PickType } from "@nestjs/swagger";
import { AllMessageDto } from "./allMessage.dto";

export class OfficialMessageDto extends PickType(AllMessageDto, [
  'to',
  'content',
  'isNeedToConfirm',
  'callback'
]) {}