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
// import { Role } from '@/enum/roles'
// import { Roles } from '@/common/decorators/Role/roles.decorator';
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('recruitment')
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}
  
  @Get('getUserApplication')
  @ApiResponse({ type: warpResponse({ type: AllRecruitmentDto })})
  async getUserApplication(@Request() { user }: any): Promise<Result<AllRecruitmentDto>> {
    return await this.recruitmentService.findOne(user);
  }

  @Post('updateApplicationForm')
  @ApiResponse({ type: warpResponse({ type: 'string' } ) })
  async create(
    @Request() { user }: any,
    @Body() updateRecruitmentDto: UpdateRecruitmentDto
  ) {
    return await this.recruitmentService.updateUserApplication(user, updateRecruitmentDto);
  }

  @Patch('sureApplocation')
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async sureApplication(@Request() { user }: any): Promise<Result<string>> {
    return await this.recruitmentService.sureApplocation(user);
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
    return await this.recruitmentService.getAllRecruitment(
      user.roles,
      +pages,
      +pageSize,
      department,
    );
  }
}
