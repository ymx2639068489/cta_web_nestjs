import { AllMessageDto } from '../message'
import { ApiProperty, IntersectionType, PartialType, PickType } from '@nestjs/swagger';
class temp{
  @ApiProperty({ description: '消息id' })
  id: number;
  @ApiProperty({ description: '对方user.id'})
  from: number;
  @ApiProperty({ description: '是否通过' })
  isConfirm: boolean;
}
export class AgreeInvitationDto extends PartialType(temp) {}
