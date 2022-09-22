import { SwaggerOk, SwaggerPagerOk } from '@/common/decorators';
import { NoAuth } from '@/common/decorators/Role/customize';
import { Result } from '@/common/interface/result';
import { GetJournalismDetailDto, GetJournalismListDto } from '@/dto/journalism';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JournalismService } from './journalism.service';

@NoAuth(0)
@ApiTags('journalism')
@Controller('journalism')
export class JournalismController {
  constructor(
    private readonly journalismService: JournalismService
  ) {}

  @Get()
  @NoAuth(0)
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'pageSize' })
  @ApiQuery({ name: 'content', required: false })
  @SwaggerPagerOk(GetJournalismListDto)
  async findAll(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('content') content: string,
  ): Promise<Result<GetJournalismListDto>> {
    return await this.journalismService.findAll(+page, +pageSize, content)
  }

  @Get('getDetails/:id')
  @NoAuth(0)
  @ApiParam({ name: 'id' })
  @ApiOperation({ description: '通过id查询新闻的详细信息' })
  @SwaggerOk(GetJournalismDetailDto)
  async getDetailsById(@Param('id') id: string) {
    return this.journalismService.findOneById(+id)
  }
}
