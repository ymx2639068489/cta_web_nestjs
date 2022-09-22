import { Result } from '@/common/interface/result';
import { AllRecruitmentDto, UpdateRecruitmentDto } from '@/dto/recruitment';
import { Recruitment } from '@/entities/recruitment';
import { User } from '@/entities/users';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import * as path from 'path';
import { ActiveTimeService } from '../active-time/active-time.service';
import { MessageService } from '../message/message.service';
import { UserDto } from '@/dto/users';
import { EmailService } from '../email/email.service';
@Injectable()
export class RecruitmentService {
  private readonly staticBasePath: string = path.join(__dirname, '../../../static');
  constructor(
    @InjectRepository(Recruitment)
    private readonly recruitmentRepository: Repository<Recruitment>,
    private readonly userService: UserService,
    private readonly activeTimeService: ActiveTimeService,
    private readonly messageService: MessageService,
    private readonly emailService: EmailService
  ) {}

  // 检查个人信息是否完善
  private checkUserInfo(user: User): string {
    const {
      id,
      password,
      createdAt,
      deletedAt,
      updatedAt,
      ...items
    } = user;
    for (const key in items) {
      if (items[key] === null) {
        return `your ${key} is null, please complete your personal information`;
      }
    }
    return '';
  }

  // 当前是否已经结束
  async isActive() {
    return await this.activeTimeService.isActive('recruitment')
  }

  // 通过user.id 查询出用户的申请表
  async findOne(id: number): Promise<Result<AllRecruitmentDto>> {
    const data = await this.recruitmentRepository.findOne({
      where: { user: id },
      relations: ['user']
    });
    if (!data) {
      return { code: -1, message: '当前用户尚未填写过表单' };
    }
    return { code: 0, message: '', data: <AllRecruitmentDto><unknown>data };
  }

  // 通过user.id 更新用户的申请表
  async updateUserApplication(
    id: number, // user.id
    updateRecruitmentDto: UpdateRecruitmentDto,
  ) {
    // 获取用户, 检查用户基础信息是否填写完整
    const user = await this.userService.findOne(id);
    // console.log(user);
    const checkUserInfoError = this.checkUserInfo(user);
    if (checkUserInfoError !== '') {
      return { code: -4, message: checkUserInfoError };
    }

    // 获取申请表中记录
    const item = await this.findOne(id);
    if (item?.data?.isDeliver) {
      return { code: -6, messae: '当前用户已提交，请取消提交后更改' };
    }
    console.log(item);
    let recruitmentItem: Recruitment;
    if (item.code === 0) {
      // 表中有记录, 需要更新
      recruitmentItem = await this.recruitmentRepository.preload({
        id: item.data.id,
        user,
        ...updateRecruitmentDto,
      });
      if (!recruitmentItem) return { code: -1, message: '更新错误' };
    } else {
      // 表中无记录，需要新建
      recruitmentItem = this.recruitmentRepository.create({
        user,
        ...updateRecruitmentDto,
      })
    }

    try {
      await this.recruitmentRepository.save(recruitmentItem);
      return { code: 0, message: '更新成功' };
    } catch (err) {
      return { code: -2, message: err }
    }
  }

  // 会员确定申请表后点击提交
  async sureApplocation(id: number): Promise<Result<string>> {
    const item = await this.findOne(id);
    
    if (item.code === -1) return { code: -1, message: '当前用户尚未填表' };
    
    const { data } = item;
    if (data.isDeliver) return { code: -2, message: '当前用户已提交' };

    try {
      const application = await this.recruitmentRepository.preload({
        id: data.id,
        isDeliver: true
      })

      if (!application) return { code: -3, message: '更新失败' };

      await this.recruitmentRepository.save(application);
      await this.emailService.sendRecuritmentEmail({
        qq: data.user.qq,
        username: data.user.username
      })
      const content = `
        Hi，${data.user.username}
          感谢你对计算机技术协会的关注！我们已经收到你的申请表并会认真评估你的干事申请表。
          通过初步评估后，我们会及时发送消息以及发送邮箱通知你进行后续的操作。
      `
      await this.messageService.createOfficialMessage({
        to:<UserDto>data.user,
        isNeedToConfirm: false,
        callback: '',
        content,
      })
      
      return { code: 0, message: '提交成功' };
    } catch (err) {
      return { code: -4, message: err };
    }
  }
  // 取消提交
  async cancelApplocation(id: number): Promise<Result<string>> {
    const item = await this.findOne(id);
    
    if (item.code === -1) return { code: -1, message: '当前用户尚未填表' };
    
    const { data } = item;
    if (!data.isDeliver) return { code: -2, message: '当前用户尚未提交' };
    // 如果没有被后台筛选（无论是什么操作，只要不是投递状态，就不能让用户修改）
    if (data.status !== 1) return { code: -4, message: '当前用户已被操作，禁止重复提交' }
    const applocation = await this.recruitmentRepository.preload({
      id: data.id,
      isDeliver: false
    })

    if (!applocation) return { code: -3, message: '更新失败' };

    try {
      await this.recruitmentRepository.save(applocation);
      return { code: 0, message: '取消提交成功' };
    } catch (err) {
      return { code: -4, message: err };
    }
  }
}
