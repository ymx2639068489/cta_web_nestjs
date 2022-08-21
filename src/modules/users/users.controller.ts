import { Controller, Post, Body, UsePipes } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto, UserLoginDto } from '../../dto/users';
import { Result } from '../../common/interface/result';
import { createUserPipe, userLoginPipe } from './pipes/encryption.pipe';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { warpResponse } from '@/src/common/interceptors';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  // 数据加密、解密、解析
  @UsePipes(new createUserPipe())
  @ApiResponse({
    type: warpResponse({ type: 'string' })
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Result<string>> {
    console.log(createUserDto.password);
    return await this.usersService.createUser(createUserDto);
  }

  @Post('login')
  @UsePipes(new userLoginPipe())
  @ApiResponse({
    type: warpResponse({ type: 'string' })
  })
  async userLogin(
    @Body() userLoginDto: UserLoginDto
  ): Promise<Result<string>> {
    console.log(userLoginDto.password);
    return await this.usersService.userlogin(userLoginDto);
  }
  // @Post('auth')
  // @ApiResponse({ type: warpResponse({ type: 'string' }) })
  // async createUserIdentity(
  //   @Body() createUserIdentityDto: CreateUserIdentityDto
  // ): Promise<Result<string>> {
  //   return await this.usersService.createUserIdentity(createUserIdentityDto)
  // }
}
