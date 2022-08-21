import { Result } from '@/src/common/interface/result';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService
  ) {}
  // JWT验证 - Step 3: 处理 jwt 签证
  async certificate(user: any): Promise<Result<string>> {
    const payload = {
      username: user.username,
      sub: user.userId,
      studentId: user.studentId,
      role: user.identity,
    };
    console.log('JWT验证 - Step 3: 处理 jwt 签证');
    try {
      const token = this.jwtService.sign(payload);
      return {
        code: 200,
        data: token,
        message: `登录成功`,
      };
    } catch (error) {
      return {
        code: 600,
        data: '',
        message: `账号或密码错误`,
      };
    }
  }
}
