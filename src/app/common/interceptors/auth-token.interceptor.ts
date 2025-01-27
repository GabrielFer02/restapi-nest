import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

export class AuthTokenInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // const request = context.switchToHttp().getRequest();
    // const token = request.headers.authorization;

    // if (!token || token !== '12345')
    //   throw new UnauthorizedException('Usuário não logado!');

    return next.handle();
  }
}
