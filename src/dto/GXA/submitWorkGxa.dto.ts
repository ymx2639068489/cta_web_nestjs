import { PartialType, IntersectionType, PickType } from "@nestjs/swagger";
import { AllGxaWorkDto } from './AllGxaWork.dto';

export class SubmitGxaWorkDto extends IntersectionType(
  class temp1 extends PickType(AllGxaWorkDto, [
    'indexHtmlImg', // 首页
    'introductionToWorks', // 网站简介
  ]) {},
  class temp2 extends PartialType(
    class temp3 extends PickType(AllGxaWorkDto, [
      'websiteUrl', // 网站部署地址
      'githubUrl',
    ]) {}
  ) {},
) {}
