import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { journalism } from '@/entities/journalism';
import { Like, Repository } from 'typeorm';
import { Api } from '@/common/utils/api';
@Injectable()
export class JournalismService {
  constructor(
    @InjectRepository(journalism)
    private readonly journalismRepository: Repository<journalism>,
  ) {}

  async findOneById(id: number) {
    const item = await this.journalismRepository.findOne({
      select: ['title', 'content', 'author', 'updatedAt', 'id'],
      where: { id, isApprove: true },
      relations: ['author'],
    })
    if (!item) return { code: -1, message: 'journalism is not found' };
    return Api.ok({
      ...item,
      author: item.author.nickName,
      time: item.updatedAt.getTime()
    })
  }
  // 获取所有
  async findAll(page: number, pageSize: number, content: string) {
    let where: any;
    if (content) {
      where = [
        // 查询标题或者内容
        { content: Like(`%${content}%`), isApprove: true },
        { title: Like(`%${content}%`), isApprove: true }
      ]
    } else where = { isApprove: true }
    const [list, total] = await this.journalismRepository.findAndCount({
      select: ['title', 'updatedAt', 'id'],
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
    return Api.pagerOk({
      total: Math.ceil(total / pageSize),
      list: list.map(item => ({
        ...item,
        time: item.updatedAt.getTime()
      }))
    })
  }
}
