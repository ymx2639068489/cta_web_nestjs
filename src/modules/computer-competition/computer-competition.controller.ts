import { SwaggerOk, SwaggerPagerBody, SwaggerPagerOk } from '@/common/decorators';
import { NoAuth } from '@/common/decorators/Role/customize';
import {
  GetListDto,
  GetSelfQuestionIdListDto,
  GetTestPaperDto,
  TestPaperEndDto,
  testPaperEndResponseDto
} from '@/dto/computerKnowledge';
import { activeName } from '@/enum/active-time';
import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ActiveTimeService } from '../active-time/active-time.service';
import { ComputerCompetitionService } from './computer-competition.service';
/**
 * 1. 开始答题
 * 2. 结束答题
 * 3. 获取榜单
 */
@ApiBearerAuth()
@ApiTags('computer-competition')
@Controller('computer-competition')
export class ComputerCompetitionController {
  constructor(
    private readonly computerService: ComputerCompetitionService,
    private readonly activeService: ActiveTimeService,
  ) {}

  @Get('start')
  @ApiOperation({ description: '开始答题，把题目返给用户' })
  @SwaggerPagerOk(Number)
  async start(@Req() { user }: any) {
    if (!await this.activeService.isActive(activeName.computer_knowledge_competition)) {
      return { code: -10, message: '活动尚未开始' };
    }
    return await this.computerService.start(user)
  }

  @Post('end')
  @ApiOperation({ description: '结束答题，收集答案' })
  @SwaggerOk(testPaperEndResponseDto)
  async end(
    @Req() { user }: any,
    @Body() testPaperEndDto: TestPaperEndDto
  ) {
    if (!await this.activeService.isActive(activeName.computer_knowledge_competition)) {
      return { code: -10, message: '活动尚未开始' };
    }
    return await this.computerService.end(user, testPaperEndDto)
  }

  @NoAuth(0)
  @Get('getlist')
  @ApiOperation({ description: '获取榜单' })
  @SwaggerPagerOk(GetListDto)
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'pageSize' })
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    return await this.computerService.findAll(page, pageSize);
  }

  @Get('getSelfQuestionList')
  @ApiOperation({ description: '获取自己做的题的id数组' })
  @SwaggerOk(GetSelfQuestionIdListDto)
  async getSelfQuestionList(@Req() { user }: any) {
    return await this.computerService.getSelfQuestion(user)
  }

  @Get('getQuestionDetaile/:id')
  @ApiOperation({ description: '通过id查询题目详细信息' })
  @ApiParam({ name: 'id' })
  @SwaggerOk()
  async getQuestionDetaileById(
    @Req() { user }: any,
    @Param('id') id: number
  ) {
    return await this.computerService.findOneById(user, id)
  }
}
