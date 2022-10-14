import { Api } from '@/common/utils/api';
import { Banner } from '@/entities/banner';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>
  ) {}
  async findOne(id: number): Promise<Banner> {
    return await this.bannerRepository.findOne({ where: { id }});
  }
  async findAll() {
    return Api.ok(await this.bannerRepository.find({
      where: { rank: Not(-1) },
      order: {
        rank: 'ASC'
      }
    }))
  }
  async findGxaAll() {
    return Api.ok(await this.bannerRepository.query(
      'select * from banner WHERE `rank` > 0 and `rank` & 1 = 1 AND `deletedAt` IS NULL ORDER BY `rank`;'
    ))
  }
  async findHomeAll() {
    return Api.ok(await this.bannerRepository.query(
      'select * from banner where `rank` > 0 and `rank` & 1 = 0 AND `deletedAt` IS NULL order by `rank`;'
    ))
  }
}
