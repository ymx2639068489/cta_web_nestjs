
import { DepartmentEnum } from "@/enum/identity.enum";
import { RecruitmentStatus } from "@/enum/recruitment";
import { PickType, PartialType, ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsNumber } from "class-validator";
import { UserDto } from "../users";
import { AllRecruitmentDto } from './allRecruitment.dto';

class temp extends PickType(AllRecruitmentDto, [
  'inchPhoto',
  'firstChoice',
  'secondChoice',
  'isAdjust',
  'curriculumVitae',
  'reasonsForElection'
]) {}

export class UpdateRecruitmentDto {
  @IsString()
  @ApiProperty({ description: '存照' })
  inchPhoto: string;

  @IsEnum(DepartmentEnum)
  @ApiProperty({
    description: '第一志愿',
    example: '算法竞赛部',
  })
  firstChoice: DepartmentEnum;

  @IsEnum(DepartmentEnum)
  @ApiProperty({
    description: '第二志愿',
    example: '项目实践部',
  })
  secondChoice: DepartmentEnum;

  @IsBoolean()
  @ApiProperty({
    description: '是否服从调剂',
    example: true,
  })
  isAdjust: boolean;

  @IsString()
  @ApiProperty({
    description: '个人简历',
    example: '我会C、C++',
  })
  curriculumVitae: string;

  @IsString()
  @ApiProperty({
    description: '竞选理由',
    example: '我很喜欢搞技术',
  })
  reasonsForElection: string;
}
