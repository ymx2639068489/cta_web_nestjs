import { ActiveTime } from '@/entities/active-time';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ActiveTimeService {
  constructor(
    @InjectRepository(ActiveTime)
    private readonly activeTimeRepository: Repository<ActiveTime>,
  ) {}

  async isActive(active: string): Promise<boolean> {
    const _1 = await this.activeTimeRepository.findOne({
      where: { activeName: active }
    })
    if (!_1) return false;
    const nowDate = new Date()
    return _1.startTime <= nowDate && nowDate <= _1.endTime
  }
}
