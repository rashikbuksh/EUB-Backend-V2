import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { authorities } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(authorities).values(value).returning({
    name: authorities.user_uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(authorities)
    .set(updates)
    .where(eq(authorities.uuid, uuid))
    .returning({
      name: authorities.user_uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(authorities)
    .where(eq(authorities.uuid, uuid))
    .returning({
      name: authorities.user_uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    uuid: authorities.uuid,
    user_uuid: authorities.user_uuid,
    category: authorities.category,
    short_biography: authorities.short_biography,
    created_at: authorities.created_at,
    updated_at: authorities.updated_at,
    user_name: hrSchema.users.name,
    user_designation: hrSchema.designation.name,
    user_department: hrSchema.department.name,
    user_email: hrSchema.users.email,
    user_phone: hrSchema.users.phone,
  }).from(authorities).leftJoin(hrSchema.users, eq(authorities.user_uuid, hrSchema.users.uuid)).leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid)).leftJoin(hrSchema.department, eq(hrSchema.users.department_uuid, hrSchema.department.uuid));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.authorities.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
