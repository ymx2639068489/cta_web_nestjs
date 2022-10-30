import { getUserInfoDto } from '@/dto/users';
import { User } from '@/entities/users';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthUserDto } from '@/dto/users';
import { MD5 } from 'crypto-js';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async findOne(studentId: string): Promise<User> {
    return this.userService.findOneByStudentId(studentId);
  }
  async validateUser(username: string, pass: string): Promise<AuthUserDto | null> {
    const user = await this.userService.findOneByStudentId(username);
    if (user && user.password === MD5(pass).toString()) {
      const result = {
        id: user.id
      }
      return result;
    }
    return null;
  }

  async login(user: any): Promise<string> {
    return this.jwtService.sign(user);
  }
}
