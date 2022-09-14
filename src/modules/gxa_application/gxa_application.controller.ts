import { warpResponse } from '@/common/interceptors';
import { Result } from '@/common/interface/result';
import {
  CreateApplicationFormDto,
  AgreeInvitationDto,
  UpdateGxaApplicationFormDto
} from '@/dto/GXA';
import { GxaDto } from '@/dto/GXA/allGxa.dto';
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
import { GxaApplicationService } from './gxa_application.service';

@ApiBearerAuth()
@ApiTags('gxa_application')
@Controller('gxa_application')
export class GxaApplicationController {
  constructor(private readonly gxaService: GxaApplicationService) {}

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
  @ApiQuery({ name: 'studentId'})
  @ApiOperation({ description: '通过学号，邀请同学组队' })
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async inviteStudent(
    @Req() { user }: any,
    @Query('studentId') studentId: string,
  ) {
    if (!await this.gxaService.register_isActive()) {
      return { code: -10, message: '当前未到报名时间或已结束' };
    }
    return await this.gxaService.inviteStudent(user, studentId);
  }

  @Post('agreeInvitation')
  @ApiOperation({ description: '消息模块的回调函数接口，用于同意好友的国信安组队邀请' })
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async agreeInvitation(
    @Req() { user }: any,
    @Body() agreeInvitationDto: AgreeInvitationDto
  ) {
    if (!await this.gxaService.register_isActive()) {
      return { code: -10, message: '当前未到报名时间或已结束' };
    }
    return await this.gxaService.agreenInvitation(user, agreeInvitationDto);
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
    if (!await this.gxaService.register_isActive()) {
      return { code: -10, message: '当前未到报名时间或已结束' };
    }
    return this.gxaService.isLeader(user);
  }
}
