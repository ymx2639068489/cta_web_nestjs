import { Controller, Get } from '@nestjs/common';
import { CommonService } from './common.service';
import { getPublicKey } from '../../common/utils/encryption';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Result } from '../../common/interface/result';
import { ApiOk } from '../../common/decorators/ApiResult.decorators';
@ApiTags('common')
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('getPublicEncryptKey')
  @ApiProperty({ description: '获取加密密钥' })
  @ApiOk(String)
  getPublicEncryptKey(): Result<string> {
    return {
      code: 0,
      data: getPublicKey(),
      message: 'success',
    };
  }
}
