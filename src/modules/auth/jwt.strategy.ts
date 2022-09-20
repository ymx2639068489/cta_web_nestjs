import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { AuthUserDto } from '@/dto/users/AuthUser.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: AuthUserDto): Promise<AuthUserDto> {
    // 除了iat 和 exp， 其他的数据都是auth.service.login中过滤的数据
    const { id } = payload;
    // if (!await this.userService.getLastLoginTime(id)) {
    //   throw new UnauthorizedException()
    // }
    const res = await this.userService.findOne(id)
    return res;
  }
}
