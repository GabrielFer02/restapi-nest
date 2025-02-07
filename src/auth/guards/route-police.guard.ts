import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_TOKEN_PAYLOAD_KEY, ROUTE_POLICE_KEY } from '../auth.constants';
import { RoutePolicies } from '../enum/route-polices.enum';

@Injectable()
export class RoutePoliceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const routePolicyRequired = this.reflector.get<RoutePolicies | undefined>(
      ROUTE_POLICE_KEY,
      context.getHandler(),
    );

    if (!routePolicyRequired) return true;

    const tokenPayload = context.switchToHttp().getRequest()[
      REQUEST_TOKEN_PAYLOAD_KEY
    ];

    if (!tokenPayload)
      throw new UnauthorizedException(
        `Permission required ${routePolicyRequired}. User user not logged in`,
      );

    // const { person }: { person: Person } = tokenPayload;

    // if (!person.routePolicies.includes(routePolicyRequired))
    //   throw new UnauthorizedException(
    //     `Permission required ${routePolicyRequired}`,
    //   );

    return true;
  }
}
