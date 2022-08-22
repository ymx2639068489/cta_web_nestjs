import { Controller, Post, Body, UseGuards, Get, Request, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserLoginDto } from '@/dto/users';
import { Result } from '@/common/interface/result';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { warpResponse } from '@/common/interceptors';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard, LocalAuthGuard } from '@/common/guard';
import { getUserInfoDto } from '@/dto/users';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
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

  @Patch('updateUserInfo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: warpResponse({ type: 'string' }) })
  async update(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Result<string>> {
    return await this.userService.update(req.user.studentId, updateUserDto);
  }
}
