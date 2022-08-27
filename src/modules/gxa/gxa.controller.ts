import { warpResponse } from '@/common/interceptors';
import {
  CreateApplicationFormDto,
  AgreeInvitationDto
} from '@/dto/GXA';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GxaService } from './gxa.service';

@ApiBearerAuth()
@ApiTags('gxa')
@Controller('gxa')
export class GxaController {
  constructor(private readonly gxaService: GxaService) {}

  @Post('createApplicationForm')
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async create(
    @Req() { user }: any,
    @Body() createApplicationFormDto: CreateApplicationFormDto,
  ) {
    return await this.gxaService.createApplication(user, createApplicationFormDto);
  }

  @Get('inviteStudent')
  @ApiQuery({ name: 'studentId'})
  @ApiResponse({ type: warpResponse({ type: 'string' })})
  async inviteStudent(
    @Req() { user }: any,
    @Query('studentId') studentId: string,
  ) {
    // console.log(user, studentId);
    await this.gxaService.inviteStudent(user, studentId);
    return studentId;
  }

  @Post('agreeInvitation')
  async agreeInvitation(
    @Req() { user }: any,
    @Body() agreeInvitationDto: AgreeInvitationDto
  ) {
    // console.log(agreeInvitationDto);
    return await this.gxaService.agreenInvitation(user, agreeInvitationDto);
  }
}
