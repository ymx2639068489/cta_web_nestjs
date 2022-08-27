import { CreateMessageDto, UpdateMessageDto } from '@/dto/message';
import { Message } from '@/entities/message';
import { User } from '@/entities/users';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async find(
    user: User,
    pages: number,
    pageSize: number,
  ) {
    const data = await this.messageRepository
      .find({
        where: [{ to: user }],
        skip: pages * pageSize,
        take: pageSize,
        relations: ['from', 'to']
      })
    const res = []
    for (const item of data) {
      res.push({
        id: item.id,
        content: item.content,
        isNeedToConfirm: item.isNeedToConfirm,
        isConfirm: item.isConfirm,
        callback: item.callback,
        from: {
          id: item.from.id,
          username: item.from.username,
          college: item.from.college,
          major: item.from.major,
          class: item.from.class,
          avatarUrl: item.from.avatarUrl
        },
        to: {
          id: item.to.id,
          username: item.to.username,
          college: item.to.college,
          major: item.to.major,
          class: item.to.class,
          avatarUrl: item.to.avatarUrl
        },
      })
    }
    return res;
  }
  async findOneByIdAndUser(
    user: User,
    id: number,
  ) {
    const data = await this.messageRepository.findOne({
      where: {
        to: user,
        id
      },
      relations: ['from']
    })
    let res = {
      id: data.id,
      content: data.content,
      isNeedToConfirm: data.isNeedToConfirm,
      isConfirm: data.isConfirm,
      callback: data.callback,
      from: {
        id: data.from.id,
        username: data.from.username,
        college: data.from.college,
        major: data.from.major,
        class: data.from.class,
        avatarUrl: data.from.avatarUrl
      },
    }
    return res;
  }
  async create(
    createMessageDto: CreateMessageDto
  ) {
    // console.log(createMessageDto);
    const message = this.messageRepository.create({
      ...createMessageDto
    });
    try {
      await this.messageRepository.save(message);
      return { code: 0, message: 'success' };
    } catch (err) {
      return { code: -1, mesage: err };
    }
  }
  async udpate(
    updateMessageDto: UpdateMessageDto
  ) {
    return await this.messageRepository.preload(updateMessageDto)
  }
}
