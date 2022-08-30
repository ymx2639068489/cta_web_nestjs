import { ApiProperty, PartialType } from '@nestjs/swagger';
class temp{
  @ApiProperty({ description: '消息id' })
  id: number;
  @ApiProperty({ description: '对方user.id'})
  from: number;
}
export class AgreeInvitationDto extends PartialType(temp) {}
