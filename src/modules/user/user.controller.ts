import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  Patch,
  Put,
  Query,
  HttpServer
} from '@nestjs/common';
import { UserService } from './user.service';
import { AllUserDto, CreateUserDto, UpdateUserDto, UserLoginDto } from '@/dto/users';
import { Result } from '@/common/interface/result';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { warpResponse } from '@/common/interceptors';
import { AuthService } from '../auth/auth.service';
import { getUserInfoDto } from '@/dto/users';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from '@/dto/users';
import { NoAuth } from '@/common/decorators/Role/customize';
import { User } from '@/entities/users';
import { SwaggerPagerOk } from '@/common/decorators';

import { Api } from '@/common/utils/api';
import { HttpService } from '@nestjs/axios';
import { CollerAndMajorList } from "@/enum/coller_major"
@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly http: HttpService
  ) {}

  @Post('login')
  @NoAuth(-1)
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  @ApiOperation({ description: '用户登录' })
  async userLogin(
    @Request() req: any,
    @Body() _userLoginDto: UserLoginDto
  ): Promise<Result<string>> {
    // 获取签证后的jwt-token
    return Api.ok(await this.authService.login(req.user));
  }

  @Get('getUserInfo')
  @ApiOperation({ description: '获取用户信息' })
  @ApiResponse({ type: warpResponse({ type: getUserInfoDto }) })
  async getProfile(@Request() req: any): Promise<Result<User>> {
    const data = await this.userService.findOne(req.user.id)
    delete data.password
    return { code: 0, message: '获取成功', data };
  }

  @Post('register')
  @NoAuth(0)
  @ApiOperation({ description: '用户注册, public' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async create(@Body() createUserDto: CreateUserDto): Promise<Result<string>> {
    // 检查数据合法性
    try {
      this.userService.checkData(createUserDto)
    } catch (err) {
      return Api.err(-1, err.message)
    }
    const user = await this.userService.findOneByStudentId(createUserDto.studentId)
    if (user) return { code: -5, message: '用户已被注册' }
    return await this.userService.createUser(createUserDto);
  }

  @Put('updateUserInfo')
  @ApiOperation({ description: '更新用户信息' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async update(
    @Request() { user }: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Result<string>> {
    console.log(updateUserDto?.phoneNumber, updateUserDto?.phoneNumber?.length);
    
    if (updateUserDto.phoneNumber && updateUserDto.phoneNumber.length !== 11) {
      return Api.err(-1, '手机号长度必须为11位')
    }
    return await this.userService.update(user.id, updateUserDto);
  }

  @Get('sendVerificationCode')
  @NoAuth(0)
  @ApiOperation({ description: '忘记密码时、发送邮箱验证码, public' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  @ApiQuery({ name: 'qq', required: true })
  @ApiQuery({ name: 'studentId', required: true })
  async sendVerificationCode(
    @Query('qq') qq: string,
    @Query('studentId') studentId: string,
  ): Promise<Result<string>> {
    const user = await this.userService.findOneByStudentId(studentId);
    if (!user || user.qq !== qq) return { code: -4, message: '用户不存在或未完善个人信息' };

    return await this.emailService.sendverifyEmailCode({ qq });
  }

  @Patch('updateUserPassword')
  @NoAuth(0)
  @ApiOperation({ description: '用户忘记密码时、同一调用此接口（邮箱验证）, public' })
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto
  ): Promise<Result<string>> {
    const f = await this.emailService.verifyMailbox(forgotPasswordDto);
    if (!f) {
      return { code: -1, message: '验证码错误' };
    }
    await this.emailService.deleteCache('邮箱验证' + forgotPasswordDto.qq + '@qq.com')
    const { code, ...result } = forgotPasswordDto;
    return await this.userService.updateByStudentId(forgotPasswordDto.studentId, result)
  }

  @Get('findOne')
  @ApiQuery({ name: 'studentId' })
  @ApiOperation({ description: '查找一个用户，' })
  @ApiResponse({ type: warpResponse({ type: AllUserDto })})
  async findOne(@Query('studentId') studentId: 'string'): Promise<Result<any>> {
    // return studentId;
    const user = await this.userService.findOneByStudentId(studentId)
    // return 
    if (!user) {
      return { code: -1, message: `studentId: ${studentId} not fount`}
    }
    const data = {
      username: user.username,
      studentId: user.studentId,
      avatarUrl: user.avatarUrl,
      college: user.college,
      major: user.major,
      class: user.class
    }
    return { code: 0, message: '', data }
  }

  @Get('getCollerList')
  @NoAuth(0)
  @ApiOperation({ description: '获取所有学院列表 public' })
  @SwaggerPagerOk(String)
  async getCollerList() {
    return Api.ok(CollerAndMajorList)
  }
}
