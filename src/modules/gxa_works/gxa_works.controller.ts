import { warpResponse } from '@/common/interceptors';
import { Result } from '@/common/interface/result';
import { AllGxaWorkDto, SubmitGxaWorkDto } from '@/dto/GXA';
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GxaWorksService } from './gxa_works.service';

@ApiTags('gxa_works')
@Controller('gxa_works')
export class GxaWorksController {
  constructor(private readonly gxaWorkService: GxaWorksService) {}

  @Post('submit')
  @ApiOperation({ description: '提交作品' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async submitWord(
    @Req() { user }: any,
    @Body() submitGxaWorkDto: SubmitGxaWorkDto
  ) {
    if (!await this.gxaWorkService.isActive()) {
      return { code: -1, message: '当前未在活动时间范围内' }
    }
    // return await this.gxaWorkService.submitWord(user, submitGxaWorkDto)
  }

  @Get()
  @ApiOperation({ description: '获取之前提交的作品信息' })
  @ApiResponse({ type: warpResponse({ type: AllGxaWorkDto }) })
  async getGxaWorkInfo(@Req() { user }: any) {
    if (!await this.gxaWorkService.isActive()) {
      return { code: -1, message: '当前未在活动时间范围内' }
    }
    // return await this.gxaWorkService.getGxaWorkInfo(user)
  }
}
