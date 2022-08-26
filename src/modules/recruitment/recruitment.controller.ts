import { Roles } from '@/common/decorators/Role/roles.decorator';
import { JwtAuthGuard } from '@/common/guard';
import { warpResponse } from '@/common/interceptors';
import { Result } from '@/common/interface/result';
import { AllRecruitmentDto, UpdateRecruitmentDto } from '@/dto/recruitment';
import { Recruitment } from '@/entities/recruitment';
import { IdentityEnum } from '@/enum/identity.enum';
import { AdminRole, Role } from '@/enum/roles';
import { Body, Controller, Get, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('recruitment')
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}
  
  @Get('getUserApplication')
  @ApiResponse({ type: warpResponse({ type: AllRecruitmentDto })})
  async getUserApplication(@Request() { user }: any): Promise<Result<AllRecruitmentDto>> {
    return await this.recruitmentService.findOne(user.id);
  }

  @Post('updateApplicationForm')
  @ApiResponse({ type: warpResponse({ type: 'string' } ) })
  async create(
    @Request() { user }: any,
    @Body() updateRecruitmentDto: UpdateRecruitmentDto
  ) {
    if (await this.recruitmentService.isEnd()) {
      return { code: -10, message: '截止报名' }
    }
    return await this.recruitmentService.updateUserApplication(user.id, updateRecruitmentDto);
  }

  @Patch('sureApplocation')
  @Roles(Role.member)
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async sureApplication(@Request() { user }: any): Promise<Result<string>> {
    if (await this.recruitmentService.isEnd()) {
      return { code: -10, message: '截止报名' }
    }
    return await this.recruitmentService.sureApplocation(user.id);
  }

  @Get('GetAllRecruitment')
  @Roles(...AdminRole)
  @ApiQuery({ name: 'pages' })
  @ApiQuery({ name: 'pageSize' })
  @ApiQuery({ name: 'department', enum: IdentityEnum, required: false })
  @ApiResponse({ type: warpResponse({ type: AllRecruitmentDto }) })
  async getAllRecruitment(
    @Request() { user }: any,
    @Query('pages') pages: string,
    @Query('pageSize') pageSize: string,
    @Query('department') department: string,
  ): Promise<Result<Recruitment>> {
    if (await this.recruitmentService.isEnd()) {
      return { code: -10, message: '截止报名' }
    }
    return await this.recruitmentService.getAllRecruitment(
      user.id,
      +pages,
      +pageSize,
      department,
    );
  }

  
  @Get('endCollectionTbale')
  @Roles(Role.LSH_HZ, Role.LSH_CWFHZ)
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async endCollectionTbale(
    @Request() { user }: any,
  ): Promise<Result<string>> {
    return await this.recruitmentService.endCollectionTbale();
  }

  @Get('startCollectionTbale')
  @Roles(Role.LSH_HZ, Role.LSH_CWFHZ)
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async startCollectionTbale(
    @Request() { user }: any,
  ): Promise<Result<string>> {
    return await this.recruitmentService.startCollectionTbale();
  }
}
