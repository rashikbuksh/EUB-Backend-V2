import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';

import type { UserAccessRoute, ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: users.uuid,
    label: users.name,
  })
    .from(users);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};

export const userAccess: AppRouteHandler<UserAccessRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: users.uuid,
    label: users.name,
    can_access: users.can_access,
  })
    .from(users);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
