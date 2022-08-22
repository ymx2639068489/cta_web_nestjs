import { getUserInfoDto } from '@/dto/users';
import { User } from '@/entities/users';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async findOne(studentId: string): Promise<User> {
    return this.userService.findOne(studentId);
  }
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user && user.password === pass) {
      // 过滤数据
      const {
        id,
        password,
        createdAt,
        deletedAt,
        updatedAt,
        phoneNumber,
        ...result
      } = user;
      return result;
    }
    return null;
  }

  login(user: getUserInfoDto): string {
    return this.jwtService.sign(user);
  }
}
