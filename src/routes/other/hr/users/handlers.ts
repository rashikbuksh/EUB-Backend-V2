import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { auth_user, users } from '@/routes/hr/schema';
import * as portfolioSchema from '@/routes/portfolio/schema';

import type { UserAccessRoute, ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { is_teacher, teacher_uuid } = c.req.valid('query');
  const resultPromise = db.select({
    value: users.uuid,
    label: sql`${users.name} || '-' || ${users.email}`,
  })
    .from(users)
    .leftJoin(portfolioSchema.teachers, eq(users.uuid, portfolioSchema.teachers.teacher_uuid));

  if (is_teacher === 'false') {
    resultPromise.where(sql`${portfolioSchema.teachers.teacher_uuid} IS NULL`);
  }
  if (teacher_uuid) {
    resultPromise.where(sql`${portfolioSchema.teachers.teacher_uuid} = ${teacher_uuid}`);
  }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};

export const userAccess: AppRouteHandler<UserAccessRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: users.uuid,
    label: sql`${users.name} || '-' || ${users.email}`,
    can_access: auth_user.can_access,
  })
    .from(auth_user)
    .leftJoin(users, eq(users.uuid, auth_user.user_uuid));

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
