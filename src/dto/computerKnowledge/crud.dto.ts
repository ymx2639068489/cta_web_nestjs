import { PartialType, PickType, IntersectionType, ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { AllQuestionDto, AllTestPaperDto } from "./all.dto";

export class CreateQuestionDto extends IntersectionType(
  class extends PickType(AllQuestionDto, [
    'topic',
    'optionA',
    'optionB',
    'ans',
    'type'
  ]) {},
  class extends PartialType(
    class extends PickType(AllQuestionDto, [
      'optionC',
      'optionD'
    ]) {}
  ) {}
) {}

export class UpdateQuestionDto extends IntersectionType(
  class extends PickType(AllQuestionDto, [
    'id'
  ]) {},
  class extends PartialType(
    class extends PickType(AllQuestionDto, [
      'topic',
      'optionA',
      'optionB',
      'optionC',
      'ans',
      'optionD',
      'type'
    ]) {}
  ) {}
) {}

export class GetTestPaperDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ description: '单选', isArray: true, default: [1] })
  singleChoice: number[];
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ description: '多选', isArray: true, default: [2] })
  MultipleChoice: number[];
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ description: '判断', isArray: true, default: [3] })
  Judgmental: number[];
}

export class TestPaperEndDto {
  @IsNotEmpty()
  @ApiProperty({ description: '用户的答案', default: { '1': 1 } })
  questions: {
    [P in string]: number
  };
}
export class GetListDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '学号' })
  studentId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '成绩' })
  score: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '时间' })
  time: number;
}
export class testPaperEndResponseDto extends PickType(AllTestPaperDto, [
  'score'
]) {}
export class GetSelfQuestionIdListDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ description: 'id数组', isArray: true })
  list: number;
}
