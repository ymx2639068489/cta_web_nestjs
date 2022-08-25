import { Controller, Get } from '@nestjs/common';
import { CommonService } from './common.service';
import { getPublicKey } from '@/common/utils/encryption';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Result } from '@/common/interface/result';
import { NoAuth } from '@/common/decorators/Role/customize';

@ApiTags('common')
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('getPublicEncryptKey')
  @NoAuth(0)
  @ApiProperty({ description: '获取加密密钥' })
  getPublicEncryptKey(): Result<string> {
    return {
      code: 0,
      data: getPublicKey(),
      message: 'success',
    };
  }
}
