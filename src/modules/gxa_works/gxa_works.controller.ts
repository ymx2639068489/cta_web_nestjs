import { warpResponse } from '@/common/interceptors';
import { Result } from '@/common/interface/result';
import { CreateFileDto } from '@/dto/common/file.dto';
import { AllGxaWorkDto, SubmitGxaWorkDto } from '@/dto/GXA';
import { Body, Controller, Get, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GxaWorksService } from './gxa_works.service';

@ApiBearerAuth()
@ApiTags('gxa_works')
@Controller('gxa_works')
export class GxaWorksController {
  constructor(private readonly gxaWorkService: GxaWorksService) {}

  @Post('submit')
  @ApiOperation({ description: '提交作品_除压缩包以外的数据' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async submitWord(
    @Req() { user }: any,
    @Body() submitGxaWorkDto: SubmitGxaWorkDto
  ) {
    if (!await this.gxaWorkService.isActive()) {
      return { code: -1, message: '当前未在活动时间范围内' }
    }
    return await this.gxaWorkService.submitWord(user, submitGxaWorkDto)
  }

  @Get()
  @ApiOperation({ description: '获取之前提交的作品信息_除压缩包以外的数据' })
  @ApiResponse({ type: warpResponse({ type: AllGxaWorkDto }) })
  async getGxaWorkInfo(@Req() { user }: any) {
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
  ) {
    if (!await this.gxaWorkService.isActive()) {
      return { code: -1, message: '当前未在活动时间范围内' }
    }
    return await this.gxaWorkService.uploadFile(user, file);
  }
}
