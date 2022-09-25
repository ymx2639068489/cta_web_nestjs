import { SwaggerOk } from '@/common/decorators';
import { NoAuth } from '@/common/decorators/Role/customize';
import { warpResponse } from '@/common/interceptors';
import { Result } from '@/common/interface/result';
import { CreateFileDto } from '@/dto/common/file.dto';
import { AllGxaWorkDto, GetAllGxaWorkDto, GetSlefGxaWorkDto, SubmitGxaWorkDto } from '@/dto/GXA';
import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActiveTimeService } from '../active-time/active-time.service';
import { GxaWorksService } from './gxa_works.service';
import { activeName } from '@/enum/active-time';

@ApiBearerAuth()
@ApiTags('gxa_works')
@Controller('gxa_works')
export class GxaWorksController {
  constructor(
    private readonly gxaWorkService: GxaWorksService,
    private readonly activeService: ActiveTimeService
  ) {}

  @Post('submit')
  @ApiOperation({ description: '提交作品_除压缩包以外的数据' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async submitWord(
    @Req() { user }: any,
    @Body() submitGxaWorkDto: SubmitGxaWorkDto
  ): Promise<Result<string>> {
    if (!await this.gxaWorkService.isActive()) {
      return { code: -1, message: '当前未在活动时间范围内' }
    }
    return await this.gxaWorkService.submitWord(user, submitGxaWorkDto)
  }

  @Get()
  @ApiOperation({ description: '获取之前提交的作品信息_除压缩包以外的数据' })
  @ApiResponse({ type: warpResponse({ type: GetSlefGxaWorkDto }) })
  async getGxaWorkInfo(@Req() { user }: any): Promise<Result<GetSlefGxaWorkDto>> {
    if (!await this.gxaWorkService.isActive()) {
      return { code: -1, message: '当前未在活动时间范围内' }
    }
    return await this.gxaWorkService.getGxaWorkInfo(user)
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 300 * 1024 * 1024 // 300MB 单位为字节
    },
  }))
  @ApiOperation({ description: '上传国信安作品, 压缩包请保持在300MB以内' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件压缩包',
    type: CreateFileDto,
  })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async uploadFile(
    @Req() { user }: any,
    @UploadedFile() file: Express.Multer.File
  ): Promise<Result<string>> {
    if (!await this.gxaWorkService.isActive()) {
      return { code: -1, message: '当前未在活动时间范围内' }
    }
    return await this.gxaWorkService.uploadFile(user, file);
  }

  @Get('getFormulaGxaList')
  @NoAuth(0)
  @ApiOperation({ description: '获取公示列表, public' })
  @SwaggerOk(GetAllGxaWorkDto)
  async getFormulaGxaList(): Promise<Result<GetAllGxaWorkDto>> {
    if (!await this.activeService.isActive(activeName.GXA_works_scoring)) {
      return { code: -1, message: '当前未到公式期' };
    }
    return await this.gxaWorkService.getFormulaGxaList()
  }

  @Get('getTeamIsApprove')
  @ApiOperation({ description: '查询自己的作品是否初审成功' })
  @SwaggerOk()
  async getTeamIsApprove(@Req() { user }: any): Promise<Result<boolean>> {
    const studentId = user.studentId
    if (!await this.activeService.isActive(activeName.GXA_approve)) {
      return { code: -1, message: '当前未到审核期' };
    }
    return await this.gxaWorkService.getTeamIsApprove(studentId)
  }

  @Get('getTeamScore')
  @ApiOperation({ description: '获取评委老师给自己打的分' })
  @SwaggerOk()
  async getTeamScore(@Req() { user }: any): Promise<Result<number[]>> {
    return this.gxaWorkService.getTeamScore(user.studentId)
  }
}
