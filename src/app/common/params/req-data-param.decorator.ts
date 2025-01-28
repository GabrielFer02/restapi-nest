import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ReqDataParam = createParamDecorator(
  (data: keyof Request, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request[data];
  },
);
