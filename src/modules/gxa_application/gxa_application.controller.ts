import { SwaggerOk } from '@/common/decorators';
import { NoAuth } from '@/common/decorators/Role/customize';
import { warpResponse } from '@/common/interceptors';
import { Result } from '@/common/interface/result';
import { Api } from '@/common/utils/api';
import {
  CreateApplicationFormDto,
  AgreeInvitationDto,
  UpdateGxaApplicationFormDto,
  GetAllGxaWorkDto,
  SubmitGxaWorkDto,
  GetSlefGxaWorkDto
} from '@/dto/GXA';
import { GxaDto } from '@/dto/GXA/allGxa.dto';
import { activeName } from '@/enum/active-time';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  Put
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActiveTimeService } from '../active-time/active-time.service';
import { GxaApplicationService } from './gxa_application.service';

@ApiBearerAuth()
@ApiTags('gxa_application')
@Controller('gxa_application')
export class GxaApplicationController {
  constructor(
    private readonly gxaService: GxaApplicationService,
    private readonly activeTimeService: ActiveTimeService,
  ) {}

  @Post('createApplicationForm')
  @ApiOperation({ description: '第一次创建报名表，只用填写队伍名就可以了' })
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async create(
    @Req() { user }: any,
    @Body() createApplicationFormDto: CreateApplicationFormDto,
  ) {
    if (!await this.gxaService.register_isActive()) {
      return { code: -10, message: '当前未到报名时间或已结束' };
    }
    return await this.gxaService.createApplication(user, createApplicationFormDto);
  }

  @Get('inviteStudent')
  @ApiQuery({ name: 'studentId' })
  @ApiOperation({ description: '通过学号，邀请同学组队' })
  @SwaggerOk(String)
  async inviteStudent(
    @Req() { user }: any,
    @Query('studentId') studentId: string,
  ) {
    if (!await this.gxaService.register_isActive()) {
      return Api.err(-10, '当前未到报名时间或已结束');
    }
    return await this.gxaService.inviteStudent(user, studentId);
  }

  @NoAuth()
  @Post('agreeInvitation')
  @ApiOperation({ description: '消息模块的回调函数接口，用于同意好友的国信安组队邀请' })
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async agreeInvitation(@Body() agreeInvitationDto: AgreeInvitationDto) {
    if (!await this.gxaService.register_isActive()) {
      return { code: -10, message: '当前未到报名时间或已结束' };
    }
    return await this.gxaService.agreenInvitation(agreeInvitationDto);
  }

  @Delete('deleteTeam')
  @ApiOperation({ description: '解散国信安队伍' })
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async delete(@Req() { user }: any): Promise<Result<string>> {
    if (!await this.gxaService.register_isActive()) {
      return { code: -10, message: '当前未到报名时间或已结束' };
    }
    return await this.gxaService.delete(user);
  }

  @Patch('quitTeam')
  @ApiOperation({ description: '退出当前队伍' })
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async quitTeam(@Req() { user }: any): Promise<Result<string>> {
    if (!await this.gxaService.register_isActive()) {
      return { code: -10, message: '当前未到报名时间或已结束' };
    }
    return await this.gxaService.quitTeam(user);
  }

  @Get('getTeamInfo')
  @ApiOperation({ description: '获取国信安队伍信息' })
  @ApiResponse({ type: warpResponse({ type: GxaDto }) })
  async getUserApplication(@Req() { user }: any): Promise<Result<GxaDto>> {
    return await this.gxaService.findOne(user);
  }

  @Get('sureApplication')
  @ApiOperation({ description: '点击确定提交' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async sureApplication(@Req() { user }: any): Promise<Result<string>> {
    if (!await this.gxaService.register_isActive()) {
      return { code: -10, message: '当前未到报名时间或已结束' };
    }
    return this.gxaService.sureApplication(user)
  }
  
  @Get('cancelApplication')
  @ApiOperation({ description: '点击取消提交' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async cancelApplication(@Req() { user }: any): Promise<Result<string>> {
    if (!await this.gxaService.register_isActive()) {
      return { code: -10, message: '当前未到报名时间或已结束' };
    }
    return this.gxaService.cancelApplication(user)
  }

  @Put('updateGxaApplicationForm')
  @ApiOperation({ description: '更新报名表' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async updateGxaApplicationForm(
    @Req() { user }: any,
    @Body() updateGxaApplicationForm: UpdateGxaApplicationFormDto
  ): Promise<Result<string>> {
    if (!await this.gxaService.register_isActive()) {
      return { code: -10, message: '当前未到报名时间或已结束' };
    }
    return this.gxaService.updateGxaApplicationForm(user, updateGxaApplicationForm)
  }

  @Patch('kickOutOfTheTeam/:kickedUserStudentId')
  @ApiOperation({ description: '根据学号将对应队友踢出队伍' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async kickOutOfTheTeam(
    @Req() { user }: any,
    @Param('kickedUserStudentId') kickedUserStudentId: string,
  ): Promise<Result<string>> {
    if (!await this.gxaService.register_isActive()) {
      return { code: -10, message: '当前未到报名时间或已结束' };
    }
    return await this.gxaService.kickOutOfTheTeam(user, kickedUserStudentId)
  }

  @Get('isLeader')
  @ApiOperation({ description: '判断自己是否为队长' })
  @ApiResponse({ type: warpResponse({ type: 'boolean' }) })
  async isLeader(@Req() { user }: any): Promise<Result<boolean>> {
    return await this.gxaService.isLeader(user);
  }

  @Get('getTeamScore')
  @ApiOperation({ description: '获取评委老师给自己打的分' })
  @SwaggerOk()
  async getTeamScore(@Req() { user }: any): Promise<Result<number[]>> {
    return await this.gxaService.getTeamScore(user)
  }

  @Get('getTeamIsApprove')
  @ApiOperation({ description: '查询自己的作品是否初审成功' })
  @SwaggerOk()
  async getTeamIsApprove(@Req() { user }: any): Promise<Result<boolean>> {
    if (!await this.gxaService.approve_isActive()) {
      return { code: -1, message: '当前未到审核期' };
    }
    return await this.gxaService.getTeamIsApprove(user);
  }
  @Get('getFormulaGxaList')
  @NoAuth(0)
  @ApiOperation({ description: '获取公示列表, public' })
  @SwaggerOk(GetAllGxaWorkDto)
  async getFormulaGxaList(): Promise<Result<GetAllGxaWorkDto>> {
    if (!await this.activeTimeService.isActive(activeName.GXA_works_scoring)) {
      return { code: -1, message: '当前未到公式期' };
    }
    return await this.gxaService.getFormulaGxaList()
  }

  
  @Post('submit')
  @ApiOperation({ description: '提交作品_除压缩包以外的数据' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async submitWord(
    @Req() { user }: any,
    @Body() submitGxaWorkDto: SubmitGxaWorkDto
  ): Promise<Result<string>> {
    if (!await this.activeTimeService.isActive('GXA_works')) {
      return Api.err(-4, '当前未在活动时间范围内'); 
    }
    return await this.gxaService.submitWord(user, submitGxaWorkDto)
  }

  @Get()
  @ApiOperation({ description: '获取之前提交的作品信息_除压缩包以外的数据' })
  @ApiResponse({ type: warpResponse({ type: GetSlefGxaWorkDto }) })
  async getGxaWorkInfo(@Req() { user }: any): Promise<Result<GetSlefGxaWorkDto>> {
    if (!await this.activeTimeService.isActive('GXA_works')) {
      return Api.err(-1, '当前未在活动时间范围内'); 
    }
    return await this.gxaService.getGxaWorkInfo(user)
  }

  
  @NoAuth(0)
  @Get('getFinallyList')
  @ApiOperation({ description: 'public 获取决赛名单' })
  @SwaggerOk()
  async getFinalsTeamList() {
    if (!await this.activeTimeService.isActive(activeName.GXA_finals)) {
      return { code: -10, message: '未到时间'}
    }
    return await this.gxaService.getFinalsTeamList()
  }
}
