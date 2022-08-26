import { User } from "@/entities/users";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GxaDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '第几届', default: new Date().getFullYear() })
  session: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '作品名称' })
  workName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '队伍名称' })
  teamName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '参赛组别 false->静态, true->动态' })
  group: boolean;

  @IsNotEmpty()
  @ApiProperty({ description: '队长' })
  leader: User;

  @ApiProperty({ description: '队员1' })
  teamMumber1: User;

  @ApiProperty({ description: '队员2' })
  teamMumber2: User;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '队伍成员特长' })
  teamMumberSpecialty: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '作品简介' })
  introductionToWorks: string;
}