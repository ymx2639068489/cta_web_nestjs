import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@/enum/roles';
import { ROLES_KEY } from '../decorators/Role/roles.decorator';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const data = context.switchToHttp().getRequest();
    const user = await this.userService.findOne(data.user.id)
    return requiredRoles.some((role) => user?.identity.id === role);
  }
}
