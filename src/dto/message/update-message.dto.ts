
import { PartialType } from "@nestjs/swagger";
import { AllMessageDto } from '.';

export class UpdateMessageDto extends PartialType(AllMessageDto) {}