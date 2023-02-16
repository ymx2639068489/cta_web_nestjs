import { SwaggerOk } from '@/common/decorators';
import { NoAuth } from '@/common/decorators/Role/customize';
import { warpResponse } from '@/common/interceptors';
import { Result } from '@/common/interface/result';
import { CreateFileDto } from '@/dto/common/file.dto';
import { GetAllGxaWorkDto, GetSlefGxaWorkDto, SubmitGxaWorkDto } from '@/dto/GXA';
import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file', {
  //   limits: {
  //     fileSize: 300 * 1024 * 1024 * 8 // 300MB 单位为字节
  //   },
  // }))
  // @ApiOperation({ description: '上传国信安作品, 压缩包请保持在300MB以内' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({ description: '文件压缩包', type: CreateFileDto, })
  // @ApiResponse({ type: warpResponse({ type: 'string' }) })
  // async uploadFile(
  //   @Req() { user }: any,
  //   @UploadedFile() file: Express.Multer.File
  // ): Promise<Result<string>> {
  //   if (!await this.gxaWorkService.isActive()) {
  //     return { code: -1, message: '当前未在活动时间范围内' }
  //   }
  //   return await this.gxaWorkService.uploadFile(user, file);
  // }
}
