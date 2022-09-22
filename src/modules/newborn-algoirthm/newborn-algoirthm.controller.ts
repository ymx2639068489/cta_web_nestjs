import { SwaggerOk } from '@/common/decorators';
import { activeName } from '@/enum/active-time';
import { Controller, Delete, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ActiveTimeService } from '../active-time/active-time.service';
import { NewbornAlgoirthmService } from './newborn-algoirthm.service';

@ApiBearerAuth()
@ApiTags('newborn-algoirthm')
@Controller('newborn-algoirthm')
export class NewbornAlgoirthmController {
  constructor(
    private readonly newbornService: NewbornAlgoirthmService,
    private readonly activeService: ActiveTimeService,
  ) {}
  private async isActive(): Promise<boolean> {
    return this.activeService.isActive(activeName.newborn_algorithm_competition)
  }
  @Post('signUp/:school')
  @ApiOperation({ description: '参赛报名' })
  @ApiParam({ name: 'school', description: 'true -> 宜宾校区, false->自贡校区' })
  @SwaggerOk()
  async create(@Req() { user }: any, @Param('school') school: boolean) {
    if (!await this.isActive()) {
      return { code: -10, message: '未到报名时间' }
    }
    return await this.newbornService.create(user, school)
  }
  @Delete('cancellation')
  @ApiOperation({ description: '取消报名' })
  @SwaggerOk()
  async delete(@Req() { user }: any) {
    if (!await this.isActive()) {
      return { code: -10, message: '未到报名时间' }
    }
    return await this.newbornService.delete(user)
  }
}
