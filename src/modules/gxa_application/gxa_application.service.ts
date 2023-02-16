import {
  AgreeInvitationDto,
  CreateApplicationFormDto,
  SubmitGxaWorkDto,
  UpdateGxaApplicationFormDto
} from '@/dto/GXA';
import { GxaDto } from '@/dto/GXA/allGxa.dto';
import { User } from '@/entities/users';
import { GxaApplicationForm } from '@/entities/GXA';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { desensitizationFn } from '@/common/utils/desensitization'
import { ActiveTimeService } from '../active-time/active-time.service';
import { Result } from '@/common/interface/result';
import { EmailService } from '../email/email.service';
import { Api } from '@/common/utils/api';
import { GXA_STATUS } from '@/enum/gxa';
import { Cache } from 'cache-manager';
@Injectable()
export class GxaApplicationService {
  constructor(
    @InjectRepository(GxaApplicationForm)
    private readonly gxaApplicationFormRepository: Repository<GxaApplicationForm>,
    private readonly userService: UserService,
    private readonly activeTimeService: ActiveTimeService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  private getNowSession(): number {
    let now = new Date();
    if (now.getMonth() >= 9) return now.getFullYear();
    return now.getFullYear() - 1;
  }

  // 当前用户是否为队长
  async isLeader(user: User) {
    const application = await this.findOneByLeader(user);
    if (application) return { code: 0, message: '', data: true }
    return { code: 0, message: '', data: false }
  }

  // 报名是否截止
  async register_isActive(): Promise<boolean> {
    return await this.activeTimeService.isActive('GXA_register');
  }
  // 是否在审核
  async approve_isActive(): Promise<boolean> {
    return await this.activeTimeService.isActive('GXA_approve');
  }

  // 获取用户是队长的队伍
  async findOneByLeader(user: User): Promise<GxaApplicationForm> {
    return await this.gxaApplicationFormRepository.findOne({
      where: { leader: user, session: this.getNowSession() },
      relations: ['leader', 'teamMember1', 'teamMember2']
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
    const session: number = this.getNowSession();
    return await this.gxaApplicationFormRepository.findOne({
      where: [
        { leader: user, session, },
        { teamMember1: user, session, },
        { teamMember2: user, session, },
      ],
      relations: ['leader', 'teamMember1', 'teamMember2']
    })
  }

  // 创建一个报名表
  async createApplication(
    user: User,
    createApplicationFormDto: CreateApplicationFormDto
  ): Promise<Result<string>> {
    if (!createApplicationFormDto.teamName) return Api.err(-9, '团队名不能为空');
    // 先检查用户是否已经注册过了
    const _form = await this.findOneByUser(user);
    if (_form) return Api.err(-2, `当前用户已经创建或参加队伍了。请联系队长在其网站中修改信息`);
    const applicationForm = this.gxaApplicationFormRepository.create({
      leader: user,
      session: this.getNowSession(),
      score: `{}`,
      ...createApplicationFormDto,
    });

    try {
      await this.gxaApplicationFormRepository.save(applicationForm);
      return Api.ok()
    } catch (err) {
      return Api.err(-1, err.message);
    }
    
  }

  async setInviteCache(from: string | number, to: string | number) {
    return await this.cacheService.set(`GXA_INVITE:${from}->${to}`, 1, { ttl: 36000 });
  }
  async getInviteCache(from: string | number, to: string | number) {
    return await this.cacheService.get(`GXA_INVITE:${from}->${to}`);
  }
  async delInviteCache(from: string | number, to: string | number) {
    return await this.cacheService.del(`GXA_INVITE:${from}->${to}`);
  }

  // 邀请好友
  async inviteStudent(user: User, studentId: string): Promise<Result<string>> {
    const application = await this.gxaApplicationFormRepository.findOne({
      where: { leader: user, session: this.getNowSession() },
      relations: ['leader', 'teamMember1', 'teamMember2']
    });
    if (!application) return Api.err(-1, '请先创建队伍');
    if (application.status === GXA_STATUS.REGISTERED)
      return Api.err(-5, '当前队伍已经报名，需要修改请取消报名');
    if (application.leader.studentId === studentId)
      return Api.err(-4, '不能自己拉自己');
    if (application.teamMember1?.studentId === studentId)
      return Api.err(-2, '对方已在队伍中');
    if (application.teamMember2?.studentId === studentId)
      return Api.err(-2, '对方已在队伍中');

    const to = await this.userService.findOneByStudentId(studentId);

    const last = await this.getInviteCache(application.leader.id, to.id);
    if (last) return Api.err(-3, '已向对方发出邀请，请同学在一小时内查看邮箱，否则失效');
    try {
      
      await this.emailService.sendInviteGxaByStudentEmail({
        qq: to.qq,
        toUsername: to.username,
        fromUsername: application.leader.username,
        teamName: application.teamName,
        agreenInvitation: 'http://qiaohuhu.xyz:3000/invite',
        fromUserId: application.leader.id,
      });
      
      await this.setInviteCache(application.leader.id, to.id);
      return Api.ok();
    } catch (err) {
      return Api.err(-3, err.message);
    }
  }

  // 同意对方的邀请
  async agreenInvitation(agreeInvitationDto: AgreeInvitationDto): Promise<Result<string>> {
    // 接受邀请的同学A
    const user = await this.userService.findOneByQQ(agreeInvitationDto.qq);
    // 检查A同学是否有队伍了
    let form = await this.findOneByUser(user);
    if (form) {
      if (
        form.teamName === agreeInvitationDto.teamName &&
        form.leader.username === agreeInvitationDto.fromUsername
      ) return Api.err(-1, '您已在他的队伍中');
      return Api.err(-2, '您已加入其他队伍, 请先退出当前队伍');
    }
    // 查询发出邀请的同学B所在的队伍
    form = await this.gxaApplicationFormRepository.findOne({
      where: {
        session: this.getNowSession(),
        leader: agreeInvitationDto.fromUserId,
        teamName: agreeInvitationDto.teamName,
      },
      relations: ['leader','teamMember1', 'teamMember2'],
    });
    
    // 检查对方队伍是否有效
    if (!form) return Api.err(-3, '对方队伍已解散, 请重新邀请');
    // 检查B是否真的向A发送邀请了
    const mes = await this.getInviteCache(form.leader.id, user.id);
    if (!mes) return Api.err(-3, '邀请失效，请重新邀请');
    // 对方队伍是否已经报名了
    if (form.status !== GXA_STATUS.CREATE) return Api.err(-4, '对方队伍已报名参赛');
    if (form.teamMember1 && form.teamMember2) return Api.err(-5, '对方队伍已满');
    try {
      if (!form.teamMember1) {
        form = await this.gxaApplicationFormRepository.preload({
          ...form,
          teamMember1: user,
        })
      } else {
        form = await this.gxaApplicationFormRepository.preload({
          ...form,
          teamMember2: user,
        })
      }
      await this.delInviteCache(form.leader.id, user.id);
      await this.gxaApplicationFormRepository.save(form);
      return Api.ok();
    } catch (error) {
      return Api.err(-6, error.message);
    }
  }

  // 解散队伍
  async delete(user: User): Promise<Result<string>> {
    const application = await this.findOneByLeader(user);
    if (!application) return Api.err(-2, '当前用户尚未创建队伍');
    if (application.status !== GXA_STATUS.CREATE)
      return Api.err(-3, '当前队伍已经参赛报名，需要修改请取消报名');

    try {
      await this.gxaApplicationFormRepository.softRemove(application);
      return Api.ok();
    } catch (err) {
      return Api.err(-1, err.message);
    }
  }

  // 退出当前队伍
  async quitTeam(user: User): Promise<Result<string>> {
    const application = await this.findOneByUser(user);
    // 如果没有报名表
    if (!application) return Api.err(-2, '当前用户尚未加入任何');
    if (application.status !== GXA_STATUS.CREATE)
      return Api.err(-3, '当前队伍已经参赛报名，需要修改请取消报名');
    // 如果是队长
    if (application.leader?.id === user?.id) return Api.err(-3, '队长不能退出队伍，只能解散');
    // 否则是队员
    try {
      let preload: any;
      if (application.teamMember1?.id === user?.id) {
        preload = await this.gxaApplicationFormRepository.preload({
          ...application,
          teamMember1: null
        })
      } else if (application.teamMember2?.id === user?.id) {
        preload = await this.gxaApplicationFormRepository.preload({
          ...application,
          teamMember2: null
        })
      }
      await this.gxaApplicationFormRepository.save(preload);
      return { code: 0, message: '退出队伍成功' };
    } catch (err) {
      return { code: -1, message: err };
    }
  }

  // 取消提交报名表
  async cancelApplication(user: User): Promise<Result<string>> {
    const application = await this.findOneByLeader(user);
    if (!application) return Api.err(-1, '当前用户没有组队或不是队长，请队长提交报名表');

    if (application.status === GXA_STATUS.CREATE) return Api.err(-2, '当前队伍尚未提交');

    try {
      await this.gxaApplicationFormRepository.save(
        await this.gxaApplicationFormRepository.preload({
          ...application,
          status: GXA_STATUS.CREATE,
        })
      );
      return { code: 0, message: '取消提交成功' };
    } catch (err) {
      return { code: -3, message: err };
    }
  }

  // 提交报名表
  async sureApplication(user: User): Promise<Result<string>> {
    const application = await this.findOneByLeader(user);
    if (!application) return Api.err(-1, '当前用户没有组队或不是队长，请队长提交报名表');
    for (const key of ['workName', 'teamName', 'teamMemberSpecialty', 'introductionToWorks']) {
      if (!application[key]) return Api.err(-7, `队伍信息不全（${key}），请先完善队伍信息`)
    }
    if (application.status === GXA_STATUS.REGISTERED)
      return Api.err(-2, '已经提供过了，请勿重复提交');

    try {
      await this.gxaApplicationFormRepository.save(
        await this.gxaApplicationFormRepository.preload({
          ...application,
          status: GXA_STATUS.REGISTERED,
        })
      );
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
    if (!application) return Api.err(-1, '当前用户没有组织队伍或不是队长');

    if (application.status !== GXA_STATUS.CREATE)
      return Api.err(-3, '当前队伍已经报名，需要修改请取消报名');

    let item: any;
    try {
      if (application.teamMember1?.studentId === kickedUserStudentId) {
        item = await this.gxaApplicationFormRepository.preload({
          ...application,
          teamMember1: null,
        });
      } else if (application.teamMember2?.studentId === kickedUserStudentId) {
        item = await this.gxaApplicationFormRepository.preload({
          ...application,
          teamMember2: null,
        });
      } else {
        return Api.err(-2, '对方不在你的队伍中');
      }
      await this.gxaApplicationFormRepository.save(item);
      return Api.ok();
    } catch (err) {
      return Api.err(-3, err.message);
    }
  }

  // 更新报名表信息
  async updateGxaApplicationForm(
    leader: User,
    updateApplicationFormDto: UpdateGxaApplicationFormDto
  ): Promise<Result<string>>  {
    const _application = await this.findOneByLeader(leader)
    if (!_application) return Api.err(-1, '用户尚未组织队伍,请联系队长更改信息');
    if (_application.status !== GXA_STATUS.CREATE)
      return Api.err(-3, '当前队伍已经报名，需要修改请取消报名');
    try {
      await this.gxaApplicationFormRepository.save(
        await this.gxaApplicationFormRepository.preload({
          ..._application,
          ...updateApplicationFormDto
        })
      )
      return Api.ok();
    } catch (err) {
      return Api.err(-2, err.message);
    }
  }

  // 获取评委老师打分
  async getTeamScore(user: any) {
    const form = await this.findOneByUser(user);
    if (!form) return Api.err(-1, '未参赛');
    if (form.status !== GXA_STATUS.SCORE && form.status !== GXA_STATUS.SCORED)
      return Api.err(-2, '尚未打分');

    if (form.score) {
      const score = JSON.parse(form.score);
      const data: number[] = [];
      for (const key in score) {
        data.push(score[key].reduce((pre: number, curt: number) => pre + curt, 0));
      }
      return Api.ok(data);
    } else {
      return Api.ok([]);
    }
  }
  
  // 查询用户队伍是否通过初审
  async getTeamIsApprove(user: any) {
    const form = await this.findOneByUser(user);
    if (form) return Api.ok(form.status >= GXA_STATUS.APPROVE);
    return Api.err(-1, '未提交作品');
  }

  // 获取公式名单
  async getFormulaGxaList() {
    let list: GxaApplicationForm[] = await this.gxaApplicationFormRepository.find({
      where: {
        status: MoreThanOrEqual(GXA_STATUS.APPROVE),
        session: this.getNowSession(),
      }
    });
    
    const staticList = [], dynamicList = [];
    list.forEach((item: GxaApplicationForm) => {
      const itemResult = {
        teamName: item.teamName,
        workName: item.workName,
        indexHmtlImg: item.indexHtmlImg,
        websiteUrl: item.websiteUrl,
        introductionToWorks: item.introductionToWorks,
      };
      if (!item.group) staticList.push(itemResult);
      else dynamicList.push(itemResult)
    })
    return Api.ok({ staticList, dynamicList });
  }

  // 提交除了压缩包以外的数据
  async submitWord(user: User, submitGxaWorkDto: SubmitGxaWorkDto) {
    const application = await this.findOneByLeader(user);
    if (!application) return Api.err(-1, '用户没有提交报名表，无法参赛');
    if (![GXA_STATUS.REGISTERED, GXA_STATUS.WORK].includes(application.status))
      return Api.err(-2, '当前作品已被初审通过或状态异常');
    
    if (!submitGxaWorkDto.githubUrl) return Api.err(-2, '请填写git地址');
    if (!submitGxaWorkDto.websiteUrl) return Api.err(-2, '请填写部署地址');
    
    try {
      await this.gxaApplicationFormRepository.save(
        await this.gxaApplicationFormRepository.preload({
          ...application,
          ...submitGxaWorkDto,
          status: GXA_STATUS.WORK,
        })
      )
      return Api.ok();
    } catch (err) {
      return Api.err(-3, err.message)
    }
  }

  // 获取除了压缩包以外的所有数据
  async getGxaWorkInfo(user: User) {
    const application = await this.findOneByUser(user);
    if (!application) return Api.err(-1, '用户尚未报名');
    if (application.status === GXA_STATUS.CREATE)
      return Api.err(-2, '当前用户尚未报名');
    
    const item = await this.gxaApplicationFormRepository.findOne({
      select: [
        'githubUrl',
        'websiteUrl',
        'group',
        'indexHtmlImg',
        'id',
        'introductionToWorks',
        'workName',
        'teamName',
        'status',
      ],
      where: [{ leader: user }, { teamMember1: user }, {teamMember2: user}],
    });
    if (item) return Api.ok(item);
    return Api.err(-2, '用户尚未提交');
  }
  // 获取决赛名单
  async getFinalsTeamList() {
    const list: GxaApplicationForm[] = await this.gxaApplicationFormRepository.find({
      where: {
        status: GXA_STATUS.FINALLY,
        session: this.getNowSession(),
      },
      relations: ['leader', 'teamMember1', 'teamMember2'],
    })
    const staticList = [], dynamicList = [];
    list.map((item: GxaApplicationForm) => {
      const res: any = {
        teamName: item.teamName,
        workName: item.workName,
        group: item.group,
        networkScore: item.networkScore,
      };
      for (const team of ['leader', 'teamMember1', 'teamMember2']) {
        if (item[team]) {
          res[team] = {};
          for (const key of ['username', 'studentId', 'college', 'major', 'class']) {
            res[team][key] = item[team][key];
          }
        }
      }
      let score = JSON.parse(item.score);
      let scoreNumber: number = 0, cnt: number = 0;
      for (const key in score) {
        scoreNumber += score[key].reduce((pre: number, curt: number) => pre + curt, 0);
        cnt ++;
      }
      res.score = scoreNumber / cnt;
      return res;
    }).forEach(item => {
      if (item.group) dynamicList.push(item);
      else staticList.push(item);
    })
    return Api.ok({ staticList, dynamicList });
  }
}
