import { SwaggerOk } from '@/common/decorators';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActiveTimeService } from './active-time.service';
import { activeName } from '@/enum/active-time';
import { NoAuth } from '@/common/decorators/Role/customize';

@ApiTags('active-time')
@Controller('active-time')
export class ActiveTimeController {
  constructor(
    private readonly activeService: ActiveTimeService
  ) {}

  @Get('getAllActiveName')
  @ApiOperation({ description: 'public 获取所有的活动名称' })
  @NoAuth(0)
  @SwaggerOk()
  async getAllActiveName() {
    return this.activeService.getAllActiveName()
  }

  @Get(':activeName')
  @ApiOperation({ description: '获取指定活动是否已经开始' })
  @SwaggerOk()
  @NoAuth(0)
  async isActive(@Param('activeName') activeName: activeName) {
    return this.activeService.isActive(activeName)
  }
}
