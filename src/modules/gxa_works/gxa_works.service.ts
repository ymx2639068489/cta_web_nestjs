import { GxaWork } from '@/entities/GXA';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveTimeService } from '../active-time/active-time.service';
import { GxaApplicationService } from '../gxa_application/gxa_application.service';

@Injectable()
export class GxaWorksService {
  constructor(
    @InjectRepository(GxaWork)
    private readonly gxaWorkRepository: Repository<GxaWork>,
    private readonly gxaApplicationService: GxaApplicationService,
    private readonly activeTimeService: ActiveTimeService,
  ) {}
  
  async isActive() {
    return await this.activeTimeService.isActive('GXA_works')
  }
}
