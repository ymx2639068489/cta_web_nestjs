import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserDto,
  CreateUserIdentityDto,
  UpdateUserDto,
} from '../../dto/users';

import { User, UserIdentity } from '../../entities/users';
import { Result } from '../../common/interface/result';
import { MD5 } from 'crypto-js';
import { EmailService } from '../email/email.service';
import { Api } from '@/common/utils/api';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserIdentity)
    private readonly userIdentityRepository: Repository<UserIdentity>,
    private readonly emailService: EmailService,
  ) {}

  checkData(createUserDto: CreateUserDto) {
    const { username, studentId, qq, avatarUrl } = createUserDto;
    const grader = Number(studentId.substring(0, 2));

    if (studentId.length !== 11) throw new Error('学号长度必须为11');
    if (
      grader > Number(new Date().getFullYear().toString().substring(2, 4)) ||
      grader < Number((new Date().getFullYear() - 5).toString().substring(2, 4))
    )
      throw new Error('学号错误');
    if (isNaN(Number(studentId))) throw new Error('学号必须为纯数字');
    if (username.match(/[0-9]/)) throw new Error('姓名不能包含数字');
    if (username.length <= 1 || username.length >= 16)
      throw new Error('姓名错误');
    if (
      !avatarUrl.match(
        /https:\/\/school-serve.oss-cn-chengdu.aliyuncs.com\/upload/,
      )
    ) {
      if (
        avatarUrl !==
        'https://pic3.zhimg.com/50/v2-588f36e96451c6487478cc07640e2f9d_hd.jpg?source=1940ef5c'
      )
        throw new Error('头像错误');
    }
    if (!qq.match(/[1-9][0-9]{4,14}/)) throw new Error('qq错误');
  }

  // async setLastLogin(id: number) {
  //   await this.userRepository.save(
  //     await this.userRepository.preload({
  //       ...await this.findOne(id),
  //       lastLogin: new Date()
  //     })
  //   )
  // }

  // async getLastLoginTime(id: number) {
  //   const now = new Date()
  //   const _ = await this.findOne(id)
  //   console.log(_, now);

  //   if (!_ || !_.lastLogin) return false;
  //   return now >= _.lastLogin
  // }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['identity'],
    });
  }
  async findOneByStudentId(studentId: string): Promise<User> {
    return this.userRepository.findOne({
      where: { studentId },
      relations: ['identity'],
    });
  }

  async findOneByQQ(qq: string): Promise<User> {
    return this.userRepository.findOne({
      where: { qq },
      relations: ['identity'],
    })
  }

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<Result<string>> {
    const { studentId } = createUserDto;
    createUserDto.password = MD5(createUserDto.password).toString();
    const _1 = await this.findOneByStudentId(studentId);
    if (_1) return { code: -1, message: '注册失败，用户已经注册过了' };
    try {
      // 获取会员身份
      const identity = await this.getIdentityById(20); // 20 === 会员
      const item = this.userRepository.create({
        ...createUserDto,
        identity,
      });
      await this.emailService.sendRegisterEmail({
        qq: createUserDto.qq,
        username: createUserDto.username,
      });
      await this.userRepository.save(item);
      return { code: 0, message: '注册成功' };
    } catch (err) {
      throw new HttpException(`添加数据库失败 ${err}`, 500);
    }
  }

  private async getIdentityById(id: number): Promise<UserIdentity> {
    return await this.userIdentityRepository.findOne({ where: { id } });
  }

  async createUserIdentity(
    createUserIdentityDto: CreateUserIdentityDto,
  ): Promise<Result<string>> {
    const { department, duty } = createUserIdentityDto;
    const _1 = await this.userIdentityRepository.findOne({
      where: { department, duty },
    });
    // 如果已经存在了
    if (_1) return { code: -1, message: '添加失败、该职责已被添加过' };
    console.log(createUserIdentityDto);
    // 如果不存在, 则添加到其中
    try {
      const item = this.userIdentityRepository.create(createUserIdentityDto);
      await this.userIdentityRepository.save(item);
      return {
        code: 0,
        message: '添加成功',
      };
    } catch (err) {
      throw new HttpException(`添加数据库失败 ${err}`, 500);
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Result<string>> {
    const user = await this.findOne(id);
    if (!user) {
      return {
        code: -2,
        message: `student with studentId not found, 当前用户状态错误`,
      };
    }

    const updateUser = await this.userRepository.preload({
      id: user.id,
      ...updateUserDto,
    });
    if (!updateUser) {
      return {
        code: -2,
        message: `student with studentId not found, 当前用户尚未注册`,
      };
    }
    try {
      await this.userRepository.save(updateUser);
      return { code: 0, message: '修改成功' };
    } catch (err) {
      return { code: -2, message: err };
    }
  }

  async updateByStudentId(
    studentId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Result<string>> {
    // if (updateUserDto.)result.password =
    const user = await this.findOneByStudentId(studentId);
    if (!user) {
      return {
        code: -2,
        message: `student with studentId not found, 当前用户尚未注册`,
      };
    }

    const updateUser = await this.userRepository.preload({
      id: user.id,
      ...updateUserDto,
    });
    if (!updateUser) {
      return {
        code: -2,
        message: `student with studentId not found, 当前用户状态错误`,
      };
    }
    try {
      await this.userRepository.save(updateUser);
      return { code: 0, message: '修改成功' };
    } catch (err) {
      return { code: -2, message: err };
    }
  }
  async updatePassword(studentId: string, password: string) {
    const user = await this.findOneByStudentId(studentId);
    if (!user) return Api.err(-2, 'user is not found');
    try {
      password = MD5(password).toString();
      await this.userRepository.save(
        await this.userRepository.preload({
          ...user,
          password,
        }),
      );
      return Api.ok();
    } catch (err) {
      return Api.err(-1, err.message);
    }
  }
}
