import { Controller, Post, Body, UseGuards, Get, Request, Patch, Param, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserLoginDto } from '@/dto/users';
import { Result } from '@/common/interface/result';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { warpResponse } from '@/common/interceptors';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard, LocalAuthGuard } from '@/common/guard';
import { getUserInfoDto } from '@/dto/users';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from '@/dto/users'
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: warpResponse({ type: getUserInfoDto }) })
  getProfile(@Request() req: any) {
    return { code: 0, message: '获取成功', data: req.user };
  }

  @Post('register')
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async create(
    @Body() createUserDto: CreateUserDto
  ): Promise<Result<string>> {
    return await this.userService.createUser(createUserDto);
  }

  @Put('updateUserInfo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async update(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Result<string>> {
    return await this.userService.update(req.user.studentId, updateUserDto);
  }

  @Get('sendVerificationCode/:studentId/:qq')
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async sendVerificationCode(
    @Param('qq') qq: string,
    @Param('studentId') studentId: string,
  ): Promise<Result<string>> {
    const user = await this.userService.findOne(studentId);
    if (!user || user.qq !== qq) return { code: -4, message: '用户不存在，请先注册' };
    return await this.emailService.sendEmailCode({ email: qq + '@qq.com' });
  }

  @Patch('updateUserPassword')
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto
  ): Promise<Result<string>> {
    const f = await this.emailService.verifyMailbox(forgotPasswordDto);
    if (!f) {
      return { code: -1, message: '验证码错误' };
    }

    const { code, ...result } = forgotPasswordDto;
    return await this.userService.update(forgotPasswordDto.studentId, result)
  }
}
