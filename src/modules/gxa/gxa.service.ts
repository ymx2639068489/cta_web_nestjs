import {
  AgreeInvitationDto,
  CreateApplicationFormDto,
  UpdateGxaApplicationFormDto
} from '@/dto/GXA';
import { UserDto } from '@/dto/users';
import { GxaDto } from '@/dto/GXA/allGxa.dto';
import { User } from '@/entities/users';
import { GxaApplicationForm } from '@/entities/GXA';
import { Message } from '@/entities/message';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { MessageService } from '../message/message.service';
import { UserService } from '../user/user.service';
import { desensitizationFn } from '@/common/utils/desensitization'
import { ActiveTimeService } from '../active-time/active-time.service';
import { Result } from '@/common/interface/result';
@Injectable()
export class GxaService {
  constructor(
    @InjectRepository(GxaApplicationForm)
    private readonly gxaApplicationFormRepository: Repository<GxaApplicationForm>,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly activeTimeService: ActiveTimeService
  ) {}

  // 报名是否截止
  async register_isActive(): Promise<boolean> {
    return await this.activeTimeService.isActive('GXA_register')
  }

  // 获取用户是队长的队伍
  async findOneByLeader(user: User): Promise<GxaApplicationForm> {
    return await this.gxaApplicationFormRepository.findOne({
      where: { leader: user },
      relations: ['leader', 'teamMumber1', 'teamMumber2']
    });
  }

  // 外部接口，吧敏感信息过滤掉
  async findOne(user: User): Promise<Result<GxaDto>> {
    const application = await this.findOneByUser(user);
    if (!application) return { code: -1, message: '用户尚未报名' };
    const data = desensitizationFn(application)
    return {
      code: 0,
      message: '',
      data
    }
  }

  // 通过用户获取报名表
  async findOneByUser(user: User): Promise<GxaApplicationForm> {
    return await this.gxaApplicationFormRepository.findOne({
      where: [
        { leader: user },
        { teamMumber1: user },
        { teamMumber2: user }
      ],
      relations: ['leader', 'teamMumber1', 'teamMumber2']
    })
  }

  // 创建一个报名表
  async createApplication(
    user: User,
    createApplicationFormDto: CreateApplicationFormDto
  ): Promise<Result<string>> {
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
  ): Promise<Result<string>> {
    const application = await this.gxaApplicationFormRepository.findOne({
      where: { leader: user },
      relations: ['leader', 'teamMumber1', 'teamMumber2']
    });
    if (!application) return { code: -1, message: '请先创建队伍' };
    console.log(application, user);
    
    if (application.leader.studentId === studentId) return { code: -4, message: '不能自己拉自己' };
    if ([
        application.teamMumber1?.studentId,
        application.teamMumber2?.studentId
      ].includes(studentId)) {
      return { code: -2, message: '对方已在队伍中' };
    }
    const to = await this.userService.findOneByStudentId(studentId);
    try {
      await this.messageService.create({
        from: <UserDto>user,
        to: <UserDto>to,
        content: `${user.username} 的国信安团队>${application.teamName}<正在邀请您加入对方团队一起参加比赛，是否同意？`,
        isNeedToConfirm: true,
        callback: '/api/gxa/agreeInvitation'
      });
      return { code: 0, message: '邀请成功，等待队友确定' };
    } catch (err) {
      return { code: -3, message: err };
    }
  }

  // 同意对方的邀请
  async agreenInvitation(
    user: User,
    agreeInvitationDto: AgreeInvitationDto
  ): Promise<Result<string>> {
    const _message = await this.messageService.findOneByIdAndUser(user, agreeInvitationDto.id)

    // 消息不存在或消息双方有误， 传过来的数据有误
    if (!_message) return { code: -1, message: '没有这条消息' };
    if (_message.from?.id !== agreeInvitationDto.from) {
      return { code: -3, message: 'id对应的好友有误' }
    }
    // console.log(_message.isConfirm);
    // 如果已经通过了。
    if (_message.isConfirm) return { code: -2, message: '已通过。请勿重复点击' };

    // 查询一下当前用户是否已经参加队伍了
    const _from_application = await this.findOneByUser(user);
    if (_from_application) {
      return { code: -5, message: '您已经创建队伍或已经加入队伍，无法继续加入' };
    }

    // 查询对方的队伍
    const _application = await this.gxaApplicationFormRepository.findOne({
      where: {
        leader: agreeInvitationDto.from
      },
      relations: ['leader','teamMumber1', 'teamMumber2']
    })
    // 如果对方队伍满了
    if (_application.teamMumber1 && _application.teamMumber2) {
      return { code: -4, message: '对方队伍已满' };
    }
    try {
      await getManager().transaction(async manager => {
        // 给队长发消息说，对方已同意加入你的队伍
        await manager.save(
          Message,
          this.messageService.createOfficialMessageTransaction({
            to: <UserDto>_application.leader,
            content: `对方（${user.username}）已同意加入你的国信安队伍`,
            isNeedToConfirm: false,
            callback: '',
          })
        )
        // 更改这条消息的状态
        await manager.save(
          Message,
          await this.messageService.udpate({
            id: agreeInvitationDto.id,
            isConfirm: true,
            isRead: true,
          })
        )
        let application: any
        // 如果队友一存在
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
        await manager.save(GxaApplicationForm, application)
      })
      return { code: 0, message: '加入队伍成功' };
    } catch (err) {
      return { code: -2, message: err };
    }
  }

  // 解散队伍
  async delete(user: User): Promise<Result<string>> {
    const application = await this.findOneByLeader(user);
    if (!application) return { code: -2, message: '当前用户尚未创建队伍' };
    const content = `小队${application.teamName}的队长：${application.leader.username}解散了该队伍。`
    try {
      await getManager().transaction(async transactionalEntityManager => {
        if (application.teamMumber1) {
          await transactionalEntityManager.save(
            Message,
            this.messageService.createOfficialMessageTransaction({
              to: <UserDto>application.teamMumber1,
              content,
              isNeedToConfirm: false,
              callback: '',
            }
          ))
        }
        if (application.teamMumber2) {
          await transactionalEntityManager.save(
            Message,
            this.messageService.createOfficialMessageTransaction({
              to: <UserDto>application.teamMumber2,
              content,
              isNeedToConfirm: false,
              callback: '',
            }
          ))
        }
        await transactionalEntityManager.softRemove(GxaApplicationForm, application)
      })
      return { code: 0, message: '解散成功' };
    } catch (err) {
      return { code: -1, message: err };
    }
  }

  // 退出当前队伍
  async quitTeam(user: User): Promise<Result<string>> {
    const application = await this.findOneByUser(user);
    // 如果没有报名表
    if (!application) return { code: -2, message: '当前用户尚未加入任何' };
    // 如果是队长
    if (application.leader?.id === user?.id) return { code: -3, message: '队长不能退出队伍，只能解散' }
    // 否则是队员
    try {
      let preload: any;
      console.log(application.teamMumber1, user);
      
      if (application.teamMumber1?.id === user?.id) {
        
        preload = await this.gxaApplicationFormRepository.preload({
          ...application,
          teamMumber1: null
        })
      } else if (application.teamMumber2?.id === user?.id) {
        preload = await this.gxaApplicationFormRepository.preload({
          ...application,
          teamMumber2: null
        })
      }
      if (!preload) return { code: -4, message: '当前用户未参加任何队伍' };
      await this.gxaApplicationFormRepository.save(preload)
      await this.messageService.createOfficialMessage({
        to: <UserDto>preload.leader,
        content: `（${user.username}）已退出你的国信安队伍`,
        isNeedToConfirm: false,
        callback: '',
      })
      return { code: 0, message: '退出队伍成功' };
    } catch (err) {
      return { code: -1, message: err };
    }
  }

  // 取消提交报名表
  async cancelApplication(user: User): Promise<Result<string>> {
    const application = await this.findOneByLeader(user);
    if (!application) return { code: -1, message: '当前用户没有组队或不是队长，请队长提交报名表' };

    if (!application.isDeliver) return { code: -2, message: '已经提供过了，请勿重复提交' };

    try {
      const item = await this.gxaApplicationFormRepository.preload({
        ...application,
        isDeliver: false,
      });
      await this.gxaApplicationFormRepository.save(item);
      return { code: 0, message: '提交成功' };
    } catch (err) {
      return { code: -3, message: err };
    }
  }

  // 提交报名表
  async sureApplication(user: User): Promise<Result<string>> {
    const application = await this.findOneByLeader(user);
    if (!application) return { code: -1, message: '当前用户没有组队或不是队长，请队长提交报名表' };

    if (application.isDeliver) return { code: -2, message: '已经提供过了，请勿重复提交' };
    const content = `你所在的队伍 ${application.teamName} 已提交报名表，若需要修改请在报名截止之前修改`
    try {
      await getManager().transaction(async manager => {
        const item = await this.gxaApplicationFormRepository.preload({
          ...application,
          isDeliver: true,
          portNumber: application.id + 40000,
        })
        await manager.save(GxaApplicationForm, item)
        for (const key of ['leader', 'teamMumber1', 'teamMumber2']) {
          if (item[key]) {
            await manager.save(
              Message,
              this.messageService.createOfficialMessageTransaction({
                to: <UserDto>item[key],
                content,
                isNeedToConfirm: false,
                callback: '',
              }
            ))
          }
        }
      })
      return { code: 0, message: '提交成功' };
    } catch (err) {
      return { code: -2, message: err };
    }
  }

  // 踢掉队友
  async kickOutOfTheTeam(
    leader: User,
    kickedUserStudentId: string,
  ): Promise<Result<string>>  {
    const application = await this.findOneByLeader(leader);
    if (!application) {
      return { code: -1, message: '当前用户没有组织队伍或不是队长' };
    }
    let item: any;
    try {
      if (application.teamMumber1?.studentId === kickedUserStudentId) {
        item = await this.gxaApplicationFormRepository.preload({
          ...application,
          teamMumber1: null,
        });
      } else if (application.teamMumber2?.studentId === kickedUserStudentId) {
        item = await this.gxaApplicationFormRepository.preload({
          ...application,
          teamMumber2: null,
        });
      } else {
        return { code: -2, message: '对方不在你的队伍中' };
      }
      await this.gxaApplicationFormRepository.save(item)
      // 踢了之后发消息通知他。
      const to = await this.userService.findOneByStudentId(kickedUserStudentId)
      const content =  `队伍 ${item.teamName} 的队长${item.leader.username}已将你踢出队伍`
      this.messageService.createOfficialMessage({
        to: <UserDto>to,
        content,
        isNeedToConfirm: false,
        callback: '',
      })
      return { code: 0, message: '对方已被踢出队伍' }; 
    } catch (err) {
      return { code: -3, message: err };
    }
  }

  // 更新报名表信息
  async updateGxaApplicationForm(
    leader: User,
    updateApplicationFormDto: UpdateGxaApplicationFormDto
  ): Promise<Result<string>>  {
    const _application = await this.findOneByLeader(leader)
    if (!_application) return { code: -1, message: '用户尚未组织队伍,请联系队长更改信息' };
    try {
      await this.gxaApplicationFormRepository.save(
        await this.gxaApplicationFormRepository.preload({
          ..._application,
          ...updateApplicationFormDto
        })
      )
      return { code: 0, message: '更新成功' };
    } catch (err) {
      return { code: -2, message: err };
    }
  }
}
