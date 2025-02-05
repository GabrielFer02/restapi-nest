import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const role = context.switchToHttp().getRequest()['user']?.role;

    return role === 'admin';
  }
}
