import { ApiProperty, PartialType } from '@nestjs/swagger';
class temp{
  @ApiProperty({ description: '消息id' })
  teamName: string;
  @ApiProperty({ description: '对方user.id'})
  fromUsername: string;
  @ApiProperty({ description: '对方qq'})
  qq: string;
  @ApiProperty({ description: '对方用户id'})
  fromUserId: number | string;
}
export class AgreeInvitationDto extends PartialType(temp) {}
