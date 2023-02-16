import { PickType } from "@nestjs/swagger";
import { AllGxaWorkDto } from "./AllGxaWork.dto";

export class GetSlefGxaWorkDto extends PickType(AllGxaWorkDto, [
  'id',
  'indexHtmlImg',
  'introductionToWorks',
  'websiteUrl',
  'githubUrl',
]) {}