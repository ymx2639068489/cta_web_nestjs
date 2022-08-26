import { ApiProperty } from "@nestjs/swagger";
export class getUserInfoDto {
  @ApiProperty({ description: 'id', example: 20})
  id: number;
}
