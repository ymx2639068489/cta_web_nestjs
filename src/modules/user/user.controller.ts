import { Controller, Post, Body, UseGuards, Get, Request, Patch, Param, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserLoginDto } from '@/dto/users';
import { Result } from '@/common/interface/result';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { warpResponse } from '@/common/interceptors';
import { AuthService } from '../auth/auth.service';
import { getUserInfoDto } from '@/dto/users';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from '@/dto/users';
import { NoAuth } from '@/common/decorators/Role/customize';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @Post('login')
  @NoAuth(-1)
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async userLogin(
    @Request() req: any,
    @Body() _userLoginDto: UserLoginDto
  ): Promise<Result<string>> {
    // 获取签证后的jwt-token
    return { code: 0, message: '登录成功', data: this.authService.login(req.user) };
  }

  @Get('getUserInfo')
  @ApiBearerAuth()
  @ApiResponse({ type: warpResponse({ type: getUserInfoDto }) })
  async getProfile(@Request() req: any) {
    const data = await this.userService.findOne(req.user.id)
    return { code: 0, message: '获取成功', data };
  }

  @Post('register')
  @NoAuth(0)
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async create(@Body() createUserDto: CreateUserDto): Promise<Result<string>> {
    return await this.userService.createUser(createUserDto);
  }

  @Put('updateUserInfo')
  @ApiBearerAuth()
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async update(
    @Request() { user }: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Result<string>> {
    return await this.userService.update(user.id, updateUserDto);
  }

  @Get('sendVerificationCode')
  @NoAuth(0)
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  @ApiQuery({ name: 'qq', required: true })
  @ApiQuery({ name: 'studentId', required: true })
  async sendVerificationCode(
    @Query('qq') qq: string,
    @Query('studentId') studentId: string,
  ): Promise<Result<string>> {
    const user = await this.userService.findOneByStudentId(studentId);
    if (!user || user.qq !== qq) return { code: -4, message: '用户不存在或未完善个人信息' };
    return await this.emailService.sendEmailCode({
      email: qq + '@qq.com',
      subject: '用户邮箱验证',
    });
  }

  @Patch('updateUserPassword')
  @NoAuth(0)
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto
  ): Promise<Result<string>> {
    const f = await this.emailService.verifyMailbox(forgotPasswordDto);
    if (!f) {
      return { code: -1, message: '验证码错误' };
    }
    const { code, ...result } = forgotPasswordDto;
    return await this.userService.updateByStudentId(forgotPasswordDto.studentId, result)
  }
}
