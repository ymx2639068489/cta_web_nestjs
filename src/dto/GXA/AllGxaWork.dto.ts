import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { GxaDto } from "./allGxa.dto";

export class AllGxaWorkDto {
  @IsNumber()
  @ApiProperty({ description: 'id' })
  id: number;

  @IsNotEmpty()
  @ApiProperty({ description: '报名表' })
  gxaApplicationForm: GxaDto;

  @IsString()
  @ApiProperty({ description: '网站首页截图' })
  indexHtmlImg: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '网站简介' })
  introductionToWorks: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '网站地址' })
  websiteUrl: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '网站代码github地址' })
  githubUrl: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ description: '是否初审' })
  isApproved: boolean;
}