import { Api } from '@/common/utils/api';
import { newbornAlgoirthmCompetition } from '@/entities/newbornAlgorithmCompetition';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NewbornAlgoirthmService {
  constructor(
    @InjectRepository(newbornAlgoirthmCompetition)
    private readonly newbornRepository: Repository<newbornAlgoirthmCompetition>
  ) {}
  async findOneByUser(user: any) {
    return await this.newbornRepository.findOne({
      where: { user }
    })
  }
  async create(user: any, school: boolean) {
    try {
      await this.newbornRepository.save(
        this.newbornRepository.create({ user, school })
      )
      return Api.ok()
    } catch (err) {
      return { code: -1, message: err.message }
    }
  }
  async delete(user: any) {
    try {
      await this.newbornRepository.softRemove(
        await this.findOneByUser(user)
      )
      return Api.ok()
    } catch (err) {
      return { code: -1, message: err.message }
    }
  }
}
