import { SwaggerPagerOk } from '@/common/decorators';
import { GetJournalismListDto } from '@/dto/journalism';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { JournalismService } from './journalism.service';

@ApiTags('journalism')
@Controller('journalism')
export class JournalismController {
  constructor(
    private readonly journalismService: JournalismService
  ) {}

  @Get()
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'pageSize' })
  @ApiQuery({ name: 'content' })
  @SwaggerPagerOk(GetJournalismListDto)
  async findAll(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('content') content: string,
  ) {
    return await this.journalismService.findAll(+page, +pageSize, content)
  }


}
