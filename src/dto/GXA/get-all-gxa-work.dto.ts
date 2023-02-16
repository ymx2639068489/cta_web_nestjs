import { ApiProperty, PickType } from "@nestjs/swagger";
import { AllGxaWorkDto } from './AllGxaWork.dto';

class temp extends PickType(AllGxaWorkDto, [
  'id',
  'indexHtmlImg',
  'websiteUrl',
  'introductionToWorks'
]) {}

export class GetAllGxaWorkDto {
  @ApiProperty({ description: '静态作品列表', isArray: true })
  static: temp;

  @ApiProperty({ description: '动态作品列表', isArray: true })
  dynamic: temp;
}