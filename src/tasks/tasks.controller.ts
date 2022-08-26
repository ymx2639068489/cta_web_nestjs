import { NoAuth } from '@/common/decorators/Role/customize';
import { Controller, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @NoAuth(0)
  _1() {
    this.tasksService.addCron('item', '0')
  }
}
