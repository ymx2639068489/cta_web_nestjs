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
    return this.userService.findOneByStudentId(studentId);
  }
  async validateUser(username: string, pass: string): Promise<AuthUserDto | null> {
    const user = await this.userService.findOneByStudentId(username);
    if (user && user.password === pass) {
      const result = {
        id: user.id
      }
      return result;
    }
    return null;
  }

  login(user: getUserInfoDto): string {
    return this.jwtService.sign(user);
  }
}
