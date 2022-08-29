import { Roles } from '@/common/decorators/Role/roles.decorator';
import { JwtAuthGuard } from '@/common/guard';
import { warpResponse } from '@/common/interceptors';
import { Result } from '@/common/interface/result';
import { AllRecruitmentDto, UpdateRecruitmentDto } from '@/dto/recruitment';
import { Recruitment } from '@/entities/recruitment';
import { IdentityEnum } from '@/enum/identity.enum';
import { AdminRole, Role } from '@/enum/roles';
import { Body, Controller, Get, Header, Patch, Post, Query, Req, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
import { Response } from 'express';
import { CreateFileDto } from '@/dto/common/file.dto';
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('recruitment')
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}
  
  @Get('getUserApplication')
  @ApiOperation({ description: '获取用户的干事申请表信息' })
  @ApiResponse({ type: warpResponse({ type: AllRecruitmentDto })})
  async getUserApplication(@Request() { user }: any): Promise<Result<AllRecruitmentDto>> {
    return await this.recruitmentService.findOne(user.id);
  }

  @Post('updateApplicationForm')
  @ApiOperation({ description: '更新用户的干事申请表信息' })
  @ApiResponse({ type: warpResponse({ type: 'string' } ) })
  async create(
    @Request() { user }: any,
    @Body() updateRecruitmentDto: UpdateRecruitmentDto
  ) {
    if (!await this.recruitmentService.isActive()) {
      return { code: -10, message: '截止报名' }
    }
    return await this.recruitmentService.updateUserApplication(user.id, updateRecruitmentDto);
  }

  @Patch('sureApplocation')
  @ApiOperation({ description: '点击提交干事申请表' })
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async sureApplication(@Request() { user }: any): Promise<Result<string>> {
    if (!await this.recruitmentService.isActive()) {
      return { code: -10, message: '截止报名' }
    }
    return await this.recruitmentService.sureApplocation(user.id);
  }

  @Patch('cancelApplocation')
  @ApiOperation({ description: '取消提交干事申请表' })
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async cancelApplication(@Request() { user }: any): Promise<Result<string>> {
    if (!await this.recruitmentService.isActive()) {
      return { code: -10, message: '截止报名' }
    }
    return await this.recruitmentService.cancelApplocation(user.id);
  }
}
