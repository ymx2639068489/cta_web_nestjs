import { ApiProperty, } from "@nestjs/swagger";
export class CreateFileDto {
  // 这里
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any
}