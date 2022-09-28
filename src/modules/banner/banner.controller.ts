import { SwaggerOk, SwaggerPagerOk } from '@/common/decorators';
import { NoAuth } from '@/common/decorators/Role/customize';
import { AllBannerDto } from '@/dto/banner';
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
  @Get('home')
  @ApiOperation({ description: '获取首页轮播图' })
  @SwaggerPagerOk(AllBannerDto)
  async findHomeAll() {
    return await this.bannerService.findHomeAll()
  }
  @NoAuth(0)
  @Get('gxa')
  @ApiOperation({ description: '获取国信安轮播图' })
  @SwaggerPagerOk(AllBannerDto)
  async findGxaAll() {
    return await this.bannerService.findGxaAll()
  }
}
