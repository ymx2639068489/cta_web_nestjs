import { JwtAuthGuard } from '@/common/guard';
import { warpResponse } from '@/common/interceptors';
import { Result } from '@/common/interface/result';
import { AllRecruitmentDto, UpdateRecruitmentDto } from '@/dto/recruitment';
import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
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
