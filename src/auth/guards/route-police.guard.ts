import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROUTE_POLICE_KEY } from '../auth.constants';
import { RoutePolicies } from '../enum/route-polices.enum';

@Injectable()
export class RoutePoliceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const routePolicyRequired = this.reflector.get<RoutePolicies | undefined>(
      ROUTE_POLICE_KEY,
      context.getHandler(),
    );
    console.log(routePolicyRequired);
    return true;
  }
}
