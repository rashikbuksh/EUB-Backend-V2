import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { off_day } from '../schema';

const updatedByUser = alias(users, 'updated_by_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(off_day).values(value).returning({
    name: off_day.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(off_day)
    .set(updates)
    .where(eq(off_day.uuid, uuid))
    .returning({
      name: off_day.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(off_day)
    .where(eq(off_day.uuid, uuid))
    .returning({
      name: off_day.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.off_day.findMany();

  const resultPromise = db.select({
    uuid: off_day.uuid,
    from_date: off_day.from_date,
    to_date: off_day.to_date,
    created_by: off_day.created_by,
    created_by_name: users.name,
    created_at: off_day.created_at,
    updated_by: off_day.updated_by,
    updated_by_name: updatedByUser.name,
    updated_at: off_day.updated_at,
    remarks: off_day.remarks,
  })
    .from(off_day)
    .leftJoin(users, eq(users.uuid, off_day.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, off_day.updated_by));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: off_day.uuid,
    from_date: off_day.from_date,
    to_date: off_day.to_date,
    created_by: off_day.created_by,
    created_by_name: users.name,
    created_at: off_day.created_at,
    updated_by: off_day.updated_by,
    updated_by_name: updatedByUser.name,
    updated_at: off_day.updated_at,
    remarks: off_day.remarks,
  })
    .from(off_day)
    .leftJoin(users, eq(users.uuid, off_day.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, off_day.updated_by))
    .where(eq(off_day.uuid, uuid));

  const data = await resultPromise;

  // if (!data)
  //   return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
