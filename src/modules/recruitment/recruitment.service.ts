import { Result } from '@/common/interface/result';
import { AllRecruitmentDto, UpdateRecruitmentDto } from '@/dto/recruitment';
import { AuthUserDto } from '@/dto/users/AuthUser.dto';
import { Recruitment } from '@/entities/recruitment';
import { User } from '@/entities/users';
import { IdentityEnum } from '@/enum/identity.enum';
import { Role } from '@/enum/roles';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(Recruitment)
    private readonly recruitmentRepository: Repository<Recruitment>,
    private readonly userService: UserService,
    private readonly connection: Connection,
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
      if (!items[key]) {
        return `your ${key} is null, please complete your personal information`;
      }
    }
    return '';
  }

  // 当前是否已经结束
  async isEnd() {
    const item = await this.connection
      .getRepository(Recruitment)
      .createQueryBuilder('recruitment')
      .select('recruitment.isEnd')
      .orderBy('recruitment.id', 'DESC')
      .getOne();
    
    return item.isEnd;
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
    const res = {
      username: data.user.username,
      college: data.user.college,
      major: data.user.major,
      class: data.user.class,
      qq: data.user.qq,
      phoneNumber: data.user.phoneNumber,
      inchPhoto: data.inchPhoto,
      firstChoice: data.firstChoice,
      secondChoice: data.secondChoice,
      isAdjust: data.isAdjust,
      curriculumVitae: data.curriculumVitae,
      reasonsForElection: data.reasonsForElection,
      isDeliver: data.isDeliver,
      id: data.id,
    };
    return { code: 0, message: '', data: res };
  }

  // 通过user.id 更新用户的申请表
  async updateUserApplication(
    id: number, // user.id
    updateRecruitmentDto: UpdateRecruitmentDto,
  ) {
    // 获取用户, 检查用户基础信息是否填写完整
    const user = await this.userService.findOne(id);
    const checkUserInfoError = this.checkUserInfo(user);
    if (checkUserInfoError !== '') {
      return { code: -4, message: checkUserInfoError };
    }

    // 获取申请表中记录
    const item = await this.findOne(id);

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

    const applocation = await this.recruitmentRepository.preload({
      id: data.id,
      isDeliver: true
    })

    if (!applocation) return { code: -3, message: '更新失败' };

    try {
      await this.recruitmentRepository.save(applocation);
      return { code: 0, message: '提交成功' };
    } catch (err) {
      return { code: -4, message: err };
    }
  }

  // 通过role检查用户身份
  private getIdentityByRole(role: number) {
    // 理事会
    if ([Role.LSH_CWFHZ, Role.LSH_HZ, Role.LSH_JSFHZ, Role.LSH_ZGFZR].includes(role)) {
      return IdentityEnum.LSH;
    }
    // 技术部
    if ([Role.JSB_BZ, Role.JSB_FBZ].includes(role)) {
      return IdentityEnum.TRCHNICAL_SERVICE;
    }
    // 项目部
    if ([Role.XMB_BZ, Role.XMB_FBZ].includes(role)) {
      return IdentityEnum.PROJECT_PRACTICE;
    }
    // 算法部
    if ([Role.SFB_BZ, Role.SFB_FBZ].includes(role)) {
      return IdentityEnum.ALGORITHM_CONTEST;
    }
    // 组宣部
    if ([Role.ZXB_BZ, Role.ZXB_FBZ].includes(role)) {
      return IdentityEnum.ORGANIZATION_PUBLICITY;
    }
    // 秘书处
    if ([Role.MSC_FMS, Role.MSC_MSZ].includes(role)) {
      return IdentityEnum.SECRETARIAT;
    }
    // 会员
    // if (role === Role.member) return IdentityEnum.MEMBER;
    throw new TypeError(`用户权限非法，干事和会员无法获取干事申请表`)
  }

  // 根据用户身份获取所有用户表
  async getAllRecruitment(
    id: number, // user.id
    pages: number,
    pageSize: number,
    department: string,
  ): Promise<Result<Recruitment>> {
    const user = await this.userService.findOne(id);
    if (!user) return { code: -4, message: '非法访问' };

    const role = user.identity.id;
    let userIdentity: IdentityEnum;
    try {
      userIdentity = this.getIdentityByRole(role);
    } catch (err) {
      return { code: -1, message: '干事不可查看或当前用户非法', data: err };
    }

    let data: any
    if (userIdentity === IdentityEnum.LSH) {
      let where: any = null;
      if (department) {
        where = [
          { firstChoice: department, isDeliver: true },
          { secondChoice: department, isDeliver: true },
        ];
      }
      if (!where) where = { isDeliver: true };
      data = await this.recruitmentRepository.find({
        relations: ['user'],
        where,
        skip: pageSize * pages,
        take: pageSize,
      });
    } else {
      data = await this.recruitmentRepository.find({
        where: [
          { firstChoice: userIdentity },
          { secondChoice: userIdentity }
        ],
        relations: ['user'],
      });
    }
    return { 
      code: 0,
      message: `pages is ${pages}, page_size is ${pageSize}`,
      data
    };
  }

  // 结束收集干事申请表
  async endCollectionTbale(): Promise<Result<string>> {
    try {
      await this.recruitmentRepository
        .createQueryBuilder('recruitment')
        .update(Recruitment)
        .set({ isEnd: true })
        .execute();

      return { code: 0, message: '结束收集' };
    } catch (err) {
      return { code: -1, message: err };
    }
  }

  // 开始收集干事申请表
  async startCollectionTbale(): Promise<Result<string>> {
    try {
      await this.recruitmentRepository
        .createQueryBuilder('recruitment')
        .update(Recruitment)
        .set({ isEnd: false })
        .execute();

      return { code: 0, message: '开始收集' };
    } catch (err) {
      return { code: -1, message: err };
    }
  }
}
