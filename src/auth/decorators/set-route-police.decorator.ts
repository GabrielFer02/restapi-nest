import { SetMetadata } from '@nestjs/common';
import { ROUTE_POLICE_KEY } from '../auth.constants';
import { RoutePolicies } from '../enum/route-polices.enum';

export const SetRoutePolicy = (policy: RoutePolicies) => {
  return SetMetadata(ROUTE_POLICE_KEY, policy);
};
