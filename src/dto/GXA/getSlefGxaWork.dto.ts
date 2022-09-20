import { PickType } from "@nestjs/swagger";
import { AllGxaWorkDto } from "./AllGxaWork.dto";

export class GetSlefGxaWorkDto extends PickType(AllGxaWorkDto, [
  'id',
  'showImg',
  'websiteIntroduction',
  'websiteUrl',
  'githubUrl',
  'isApproved'
]) {}