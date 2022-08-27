import { AgreeInvitationDto, CreateApplicationFormDto } from '@/dto/GXA';
import { GxaApplicationForm } from '@/entities/GXA';
import { User } from '@/entities/users';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { MessageService } from '../message/message.service';
import { UserService } from '../user/user.service';

@Injectable()
export class GxaService {
  constructor(
    @InjectRepository(GxaApplicationForm)
    private readonly gxaApplicationFormRepository: Repository<GxaApplicationForm>,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly connection: Connection,
  ) {}

  // 通过用户获取报名表
  async findOneByUser(user: User) {
    return this.gxaApplicationFormRepository.findOne({
      where: [
        { leader: user },
        { teamMumber1: user },
        { teamMumber2: user }
      ]
    })
  }
  // 创建一个报名表
  async createApplication(
    user: User,
    createApplicationFormDto: CreateApplicationFormDto
  ) {
    // 删除联级查询的信息
    delete user.identity;
    // 先检查用户是否已经注册过了
    const _form = await this.findOneByUser(user);
    if (_form) {
      return { code: -2, message: `当前用户已经创建或参加队伍了。请联系队长在其网站中修改信息` };
    }
    const applicationForm = this.gxaApplicationFormRepository.create({
      leader: user,
      ...createApplicationFormDto
    });

    try {
      await this.gxaApplicationFormRepository.save(applicationForm);
      return { code: 0, message: '创建报名表成功' };
    } catch (err) {
      return { code: -1, message: err };
    }
    
  }

  // 邀请好友
  async inviteStudent(
    user: User,
    studentId: string,
  ) {
    const application = await this.findOneByUser(user);
    const to = await this.userService.findOneByStudentId(studentId);
    const message = this.messageService.create({
      from: user,
      to: to,
      content: `${user.username} 的国信安团队>${application.teamName}<正在邀请您加入对方团队一起参加比赛，是否同意？`,
      isNeedToConfirm: true,
      callback: ''
    });
    console.log(message);
    return message;
  }

  // 同意对方的邀请
  async agreenInvitation(
    user: User,
    agreeInvitationDto: AgreeInvitationDto
  ) {
    const _message = await this.messageService.findOneByIdAndUser(user, agreeInvitationDto.id)

    // 消息不存在或消息双方有误， 传过来的数据有误
    if (!_message) return { code: -1, message: '没有这条消息' };
    if (_message.from.id !== agreeInvitationDto.from) {
      return { code: -3, message: 'id对应的好友有误' }
    }
    // 如果已经通过了。
    if (_message.isConfirm) return { code: -2, message: '已通过。请勿重复点击' };
    // 查询一下当前用户是否已经参加队伍了
    const _from_application = await this.findOneByUser(<User>_message.from);
    if (_from_application) {
      return { code: -5, message: '您已经参加或创建了队伍，无法继续加入队伍' };
    }

    // 查询对方的队伍
    const _application = await this.gxaApplicationFormRepository.findOne({
      where: {
        leader: agreeInvitationDto.from
      }
    })
    // 如果对方队伍满了
    if (_application.teamMumber1 && _application.teamMumber2) {
      return { code: -4, message: '对方队伍已满' };
    }

    // 使用事务来进行处理。修改此条消息已通过，并且加入对方的队伍
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const message = await this.messageService.udpate({
        id: agreeInvitationDto.id,
        isConfirm: true,
      })

      let application: any
      // 如果队友一存在，那就存队友二，否则存队友一
      if (_application.teamMumber1) {
        application = await this.gxaApplicationFormRepository.preload({
          ..._application,
          teamMumber2: user
        })
      } else {
        application = await this.gxaApplicationFormRepository.preload({
          ..._application,
          teamMumber1: user,
        })
      }
      
      await queryRunner.manager.save(message)
      await queryRunner.manager.save(application)
      await queryRunner.commitTransaction();
    } catch (err) {
      //如果遇到错误，可以回滚事务
      await queryRunner.rollbackTransaction();
    } finally {
      //你需要手动实例化并部署一个queryRunner
      await queryRunner.release();
    }
  }
}
