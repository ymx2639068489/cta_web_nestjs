import { ActiveTime } from '@/entities/active-time';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { gxa_status, activeName as activeNameEnum } from '@/enum/active-time';
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

  async getAllActiveName() {
    return await this.activeTimeRepository.find({
      select: ['activeName']
    })
  }

  async queryGxaProgress() {
    const _ = await this.activeTimeRepository.find({
      where: gxa_status.map((item: activeNameEnum) => ({ activeName: item }))
    })
    const nowDate = new Date()
    for (const item of _) {
      if (item.startTime <= nowDate && nowDate <= item.endTime) {
        console.log('11 -> ', item.activeName);
        
        return item.activeName
      }
    }
    return _
  }

  async queryRecruitmentProgress() {
  }
}
