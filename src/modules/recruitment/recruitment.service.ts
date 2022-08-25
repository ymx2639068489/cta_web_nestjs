import { Result } from '@/common/interface/result';
import { AllRecruitmentDto, UpdateRecruitmentDto } from '@/dto/recruitment';
import { AuthUserDto } from '@/dto/users/AuthUser.dto';
import { Recruitment } from '@/entities/recruitment';
import { User } from '@/entities/users';
import { IdentityEnum } from '@/enum/identity.enum';
import { Role } from '@/enum/roles';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(Recruitment)
    private readonly recruitmentRepository: Repository<Recruitment>,
    private readonly userService: UserService
  ) {}

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
  async findOne(authUserDto: AuthUserDto): Promise<Result<AllRecruitmentDto>> {
    const data = await this.recruitmentRepository.findOne({
      where: { user: authUserDto.id },
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

  async updateUserApplication(
    authUserDto: AuthUserDto,
    updateRecruitmentDto: UpdateRecruitmentDto,
  ) {
    // 获取用户, 检查用户基础信息是否填写完整
    const user = await this.userService.findOne(authUserDto.studentId);
    const checkUserInfoError = this.checkUserInfo(user);
    if (checkUserInfoError !== '') {
      return { code: -4, message: checkUserInfoError };
    }

    // 获取申请表中记录
    const item = await this.findOne(authUserDto);

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

  async sureApplocation(authUserDto: AuthUserDto): Promise<Result<string>> {
    const item = await this.findOne(authUserDto);
    
    if (!item) return { code: -1, message: '当前用户尚未填表' };
    
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
  /**
   * roles 实际上只有一个
   */
  private getIdentityByRole(role: number) {
    // 会员
    if (role === Role.member) return IdentityEnum.MEMBER;
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
    throw new TypeError(`用户权限非法`)
  }

  async getAllRecruitment(
    roles: Role[],
    pages: number,
    pageSize: number,
    department: string,
  ): Promise<Result<Recruitment>> {
    const role = roles[0];
    let userIdentity: IdentityEnum;
    try {
      userIdentity = this.getIdentityByRole(role);
    } catch (err) {
      return { code: -1, message: err };
    }
    
    if (userIdentity === IdentityEnum.MEMBER) {
      return { code: -2, message: '当前用户是会员，无法获取对应申请表' };
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
}
