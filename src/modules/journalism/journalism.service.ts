import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { journalism } from '@/entities/journalism';
import { Repository } from 'typeorm';
import { Api } from '@/common/utils/api';
@Injectable()
export class JournalismService {
  constructor(
    @InjectRepository(journalism)
    private readonly journalismRepository: Repository<journalism>,
  ) {}

  // 根据类型模糊查询新闻
  async findOne(value: string) {
    
  }
  // 获取所有
  async findAll(page: number, pageSize: number, content: string) {
    let where: any;
    if (content) {
      where = [
        { content, isApprove: true },
        { title: content, isApprove: true }
      ]
    }
    const [list, total] = await this.journalismRepository.findAndCount({
      select: ['title', 'updatedAt'],
      where,
      order: {
        createdAt: 'DESC'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
    return Api.pagerOk({
      total: Math.ceil(total / pageSize),
      list,
      limit: pageSize,
      page,
    })
  }
}
