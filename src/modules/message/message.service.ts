import { Result } from '@/common/interface/result';
import { CreateMessageDto, OfficialMessageDto, UpdateMessageDto } from '@/dto/message';
import { Message } from '@/entities/message';
import { User } from '@/entities/users';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class MessageService {
  private official: User;
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
  ) {
    this.userService.findOneByStudentId('12345678910').then(res => {
      this.official = res
    }).catch(err => {
      console.log(err);
    })
  }

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
        relations: ['from', 'to'],
        order: {
          createdAt: 'DESC',
        },
      })
    return { code: 0, message: '', data };
  }

  async findAllByFromAndTo(from: User, to: User) {
    return await this.messageRepository.find({
      where: { to, from },
      relations: ['from', 'to'],
      order: {
        createdAt: 'DESC',
      },
    })
  }

  async findOneByIdAndUser(
    user: User,
    id: number,
  ) {
    console.log(id);
    const data = await this.messageRepository.findOne({
      where: {
        to: user,
        id
      },
      relations: ['from']
    })
    return data;
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

  async createOfficialMessage(
    officialMessageDto: OfficialMessageDto
  ) {
    return await this.messageRepository.save(
      this.messageRepository.create({
        ...officialMessageDto,
        from: this.official,
      })
    )
  }
  createOfficialMessageTransaction(officialMessageDto: OfficialMessageDto) {
    return this.messageRepository.create({
      ...officialMessageDto,
      from: this.official,
    })
  }
  createTransaction(
    createMessageDto: CreateMessageDto
  ) {
    // console.log(createMessageDto);
    return this.messageRepository.create({
      ...createMessageDto
    })
  }

  async udpate(
    updateMessageDto: UpdateMessageDto
  ) {
    return await this.messageRepository.preload(updateMessageDto)
  }
  async delete(user: User, id: number): Promise<Result<string>> {
    // const item = await this.messageRepository.findOne({ where: { to: user, id }})
    const item = await this.findOneByIdAndUser(user, id);
    if (!item) return { code: -1, message: '未找到该消息' };
    try {
      await this.messageRepository.softRemove(item)
      return { code: 0, message: '删除成功' }; 
    } catch (err) {
      return { code: -2, message: err };
    }
  }
  async readMessage(
    user: User,
    id: number,
  ): Promise<Result<string>> {
    const message = await this.findOneByIdAndUser(user, id);
    if (!message) return { code: -1, message: '未找到该消息' };
    if (message.isRead) return { code: -3, message: '已经是已读状态了' };
    try {
      await this.messageRepository.save(
        await this.messageRepository.preload({
          ...message,
          isRead: true
        })
      )
      return { code: 0, message: '已读' };
    } catch (err) {
      return { code: -2, message: err };
    }
  }


  async getTotalNumberOfUnreadMessage(user: User) {
    const number = await this.messageRepository.findAndCount({
      where: {
        to: user,
        isRead: false
      }
    })
    if (!number) return { code: 0, message: '', data: 0 }
    return { code: 0, message: '', data: number[number.length - 1] };
  }

}
