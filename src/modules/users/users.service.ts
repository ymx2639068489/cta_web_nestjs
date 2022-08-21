import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateUserDto, CreateUserIdentityDto, UserLoginDto } from '../../dto/users';

import { User, UserIdentity } from '../../entities/users';
import { Result } from '../../common/interface/result';

import { AuthService } from '../autuh/auth.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserIdentity)
    private readonly userIdentityRepository: Repository<UserIdentity>,
    private readonly connection: Connection,
    // 循环引用解决办法
    private readonly authService: AuthService,
  ) {}
  
  async findOne(studentId: string) {
    return this.userRepository.findOne({ where: studentId });
  }

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<Result<string>> {
    const { studentId } = createUserDto;
    const _1 = await this.userRepository.findOne({ where: { studentId }});
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

  async userlogin(
    { studentId, password }: UserLoginDto
  ): Promise<Result<string>> {
    const user = await this.findOne(studentId);
    if (!user) return { code: -2, message: '账号未注册', data: '' };

    if (user.password !== password) return { code: -1, message: '密码错误', data: '' };

    return this.authService.certificate(user);
  }
}
