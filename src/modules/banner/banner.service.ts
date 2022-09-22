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
}
