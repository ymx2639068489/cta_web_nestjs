import { SwaggerOk } from '@/common/decorators';
import { CreateBannerDto, UpdateBannerDto } from '@/dto/banner';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BannerService } from './banner.service';

@ApiTags('banner')
@ApiBearerAuth()
@Controller('banner')
export class BannerController {
  constructor(
    private readonly bannerService: BannerService,
  ) {}

  @Get()
  @ApiOperation({ description: '获取所有轮播图' })
  @SwaggerOk()
  async findAll() {
    return await this.bannerService.findAll()
  }
}
