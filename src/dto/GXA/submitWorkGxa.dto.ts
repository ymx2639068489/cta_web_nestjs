import { PartialType, IntersectionType, PickType } from "@nestjs/swagger";
import { AllGxaWorkDto } from './AllGxaWork.dto';

export class SubmitGxaWorkDto extends IntersectionType(
  class temp1 extends PickType(AllGxaWorkDto, [
    'showImg', // 首页
    'websiteIntroduction', // 网站简介
    'websiteUrl', // 网站部署地址
  ]) {},
  class temp2 extends PartialType(
    class temp3 extends PickType(AllGxaWorkDto, [
      'githubUrl',
    ]) {}
  ) {},
) {}
