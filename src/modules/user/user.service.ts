import { CACHE_MANAGER, forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateUserDto, CreateUserIdentityDto, UpdateUserDto, UserLoginDto } from '../../dto/users';

import { User, UserIdentity } from '../../entities/users';
import { Result } from '../../common/interface/result';
import { Cache } from 'cache-manager';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserIdentity)
    private readonly userIdentityRepository: Repository<UserIdentity>,
    private readonly connection: Connection,
  ) {}
  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['identity']
    });
  }
  async findOneByStudentId(studentId: string): Promise<User> {
    return this.userRepository.findOne({
      where: { studentId },
      relations: ['identity']
    });
  }

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<Result<string>> {
    const { studentId } = createUserDto;
    const _1 = await this.findOneByStudentId(studentId);
    if (_1) return { code: -1, message: '注册失败，用户已经注册过了' };
    try {
      // 获取会员身份
      const identity = await this.getIdentityById(20) // 20 === 会员
      const item = this.userRepository.create({
        ...createUserDto,
        identity
      })
      await this.userRepository.save(item);
      return { code: 0, message: '注册成功' };
    } catch (err) {
      throw new HttpException(`添加数据库失败 ${err}`, 500)
    }
  }

  private async getIdentityById(id: number): Promise<UserIdentity> {
    return await this.userIdentityRepository.findOne({ where: { id }});
  }

  async createUserIdentity(
    createUserIdentityDto: CreateUserIdentityDto
  ): Promise<Result<string>> {
    const { department, duty } = createUserIdentityDto;
    const _1 = await this.userIdentityRepository.findOne({ where: { department, duty } });
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
      }
    } catch (err) {
      throw new HttpException(`添加数据库失败 ${err}`, 500)
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto
  ): Promise<Result<string>> {
    const user = await this.findOne(id);
    if (!user) {
      return {
        code: -2,
        message: `student with studentId not found, 当前用户状态错误`
      };
    }

    const updateUser = await this.userRepository.preload({
      id: user.id,
      ...updateUserDto
    })
    if (!updateUser) {
      return {
        code: -2,
        message: `student with studentId not found, 当前用户尚未注册`
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
    const user = await this.findOneByStudentId(studentId);
    if (!user) {
      return {
        code: -2,
        message: `student with studentId not found, 当前用户尚未注册`
      };
    }

    const updateUser = await this.userRepository.preload({
      id: user.id,
      ...updateUserDto
    })
    if (!updateUser) {
      return {
        code: -2,
        message: `student with studentId not found, 当前用户状态错误`
      };
    }
    try {
      await this.userRepository.save(updateUser);
      return { code: 0, message: '修改成功' };
    } catch (err) {
      return { code: -2, message: err };
    }
  }

}
