import { getUserInfoDto } from '@/dto/users';
import { User } from '@/entities/users';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthUserDto } from '@/dto/users';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async findOne(studentId: string): Promise<User> {
    return this.userService.findOne(studentId);
  }
  async validateUser(username: string, pass: string): Promise<AuthUserDto | null> {
    const user = await this.userService.findOne(username);
    if (user && user.password === pass) {
      // console.log(user);
      // 过滤数据
      const {
        password,
        createdAt,
        deletedAt,
        updatedAt,
        phoneNumber,
        ...result
      } = user;
      Object.defineProperty(result, 'roles', {
        value: [result.identity.id],
        writable: false,
        configurable: false,
        enumerable: true,
      })
      delete result.identity
      return result;
    }
    return null;
  }

  login(user: getUserInfoDto): string {
    return this.jwtService.sign(user);
  }
}
