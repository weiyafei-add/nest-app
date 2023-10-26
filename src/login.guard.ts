import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!(request.session as any).user) {
      throw new UnauthorizedException('用户未登录');
    }
    return true;

    // const authorization = request.header('authorization') || '';
    // const bearer = authorization.split(' ') as Array<string>;
    // if (!bearer || bearer.length > 2) {
    //   throw new UnauthorizedException('登录token错误');
    // }

    // const token = bearer[1];

    // try {
    //   const info = this.jwtService.verify(token);

    //   (request as any).user = info.user;

    //   return true;
    // } catch (error) {
    //   throw new UnauthorizedException('登录 token 失效，请重新登录');
    // }
  }
}
