import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@/enum/roles';
import { ROLES_KEY } from '../decorators/Role/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const data = context.switchToHttp().getRequest();
    const { user } = data
    // console.log(data.user);
    // console.log(requiredRoles);

    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}
