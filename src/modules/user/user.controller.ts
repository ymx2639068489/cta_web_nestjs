import { Controller, Post, Body, UsePipes, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CreateUserDto, UserLoginDto } from '../../dto/users';
import { Result } from '../../common/interface/result';
import { createUserPipe, userLoginPipe } from './pipes/encryption.pipe';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { warpResponse } from '@/src/common/interceptors';
import { AuthService } from '../auth/auth.service';
// import { AuthGuard } from '@nestjs/passport';
// import { JwtAuthGuard } from '../autuh/jwt.auth.guard';
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService
  ) {}

  @Post('login')
  @UsePipes(new userLoginPipe())
  @ApiResponse({
    type: warpResponse({ type: 'string' })
  })
  async userLogin(
    @Body() userLoginDto: UserLoginDto
  ) {
    console.log('JWT验证 - Step 1: 用户请求登录');
    const authResult = await this.authService.validateUser(
      userLoginDto.studentId,
      userLoginDto.password
    );
    switch (authResult.code) {
      case 1:
        return this.authService.certificate(authResult.user);
      case 2:
        return {
          code: 600,
          msg: `账号或密码不正确`,
        };
      default:
        return {
          code: 600,
          msg: `查无此人`,
        };
    }
  }
  @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
  @Post('register')
  // 数据加密、解密、解析
  @UsePipes(new createUserPipe())
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Result<string>> {
    return await this.usersService.createUser(createUserDto);
  } 
}
