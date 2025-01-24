import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';

export class TimingConnectInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const latest = Date.now() - now;
        console.log(`${latest}ms`);
      }),
    );
  }
}
