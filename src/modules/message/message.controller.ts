import { warpResponse } from '@/common/interceptors';
import { Controller, Delete, Get, Param, Patch, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllMessageDto } from '@/dto/message';
import { MessageService } from './message.service';
import { Result } from '@/common/interface/result';
@ApiTags('messsage')
@ApiBearerAuth()
@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
  ) {}
  @Get()
  @ApiQuery({ name: 'pages' })
  @ApiQuery({ name: 'pageSize' })
  @ApiOperation({ description: '获取用户的所有消息，按照创建时间降序排序' })
  @ApiResponse({ type: warpResponse({ type: AllMessageDto }) })
  async getUserMessage(
    @Req() { user }: any,
    @Query('pages') pages: string,
    @Query('pageSize') pageSize: string,
  ) {
    return await this.messageService.find(user, +pages, +pageSize);
  }
  @Delete(':id')
  @ApiOperation({ description: '通过id删除消息'})
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async delete(@Req() { user }: any, @Param('id') id: string): Promise<Result<string>> {
    return await this.messageService.delete(user, +id)
  }
  @Patch(':id')
  @ApiOperation({ description: '已读消息'})
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async readMessage(@Req() { user }: any, @Param('id') id: string): Promise<Result<string>> {
    return await this.messageService.readMessage(user, +id)
  }

  @Get('notRead')
  @ApiOperation({ description: '获取未读消息' })
  @ApiResponse({ type: warpResponse({ type: 'number' }) })
  async getTotalNumberOfUnreadMessage(@Req() { user }: any) {
    return await this.messageService.getTotalNumberOfUnreadMessage(user);
  }
}
