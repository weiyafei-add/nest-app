import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RbacUserService } from './rbac_user/rbac_user.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(RbacUserService)
  private rbacUserService: RbacUserService;

  @Inject(Reflector)
  private reflector: Reflector;

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.user) {
      return true;
    }
    const rules = await this.rbacUserService.findRolesByIds(
      request.user.rules.map((item) => item.id),
    );

    const permissions = rules.reduce((total, current) => {
      total.push(...current.permissions);
      return total;
    }, []);

    const requirePermission = this.reflector.getAllAndOverride(
      'require-permission',
      [context.getClass(), context.getHandler()],
    );

    for (let i = 0; i < requirePermission.length; i++) {
      const curPermission = requirePermission[i];
      const found = permissions.find((item) => item.name === curPermission);
      if (!found) {
        throw new UnauthorizedException('您没有访问该接口的权限');
      }
    }

    return true;
  }
}
