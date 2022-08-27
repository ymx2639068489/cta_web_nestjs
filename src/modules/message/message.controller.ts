import { warpResponse } from '@/common/interceptors';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Message } from '@/entities/message';
import { AllMessageDto } from '@/dto/message';
import { MessageService } from './message.service';
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
  @ApiResponse({ type: warpResponse({ type: AllMessageDto }) })
  async getUserMessage(
    @Req() { user }: any,
    @Query('pages') pages: string,
    @Query('pageSize') pageSize: string,
  ) {
    return await this.messageService.find(user, +pages, +pageSize);
  }
}
