import { SwaggerOk } from '@/common/decorators';
import { NoAuth } from '@/common/decorators/Role/customize';
import { Controller,Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BannerService } from './banner.service';

@ApiTags('banner')
@Controller('banner')
export class BannerController {
  constructor(
    private readonly bannerService: BannerService,
  ) {}

  @NoAuth(0)
  @Get()
  @ApiOperation({ description: '获取所有轮播图' })
  @SwaggerOk()
  async findAll() {
    return await this.bannerService.findAll()
  }
}
