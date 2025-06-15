import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { qns_category } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(qns_category).values(value).returning({
    name: qns_category.name,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(qns_category)
    .set(updates)
    .where(eq(qns_category.uuid, uuid))
    .returning({
      name: qns_category.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(qns_category)
    .where(eq(qns_category.uuid, uuid))
    .returning({
      name: qns_category.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.qns_category.findMany();
  const resultPromise = db.select({
    uuid: qns_category.uuid,
    name: qns_category.name,
    index: qns_category.index,
    min_percentage: PG_DECIMAL_TO_FLOAT(qns_category.min_percentage),
    created_by: qns_category.created_by,
    created_by_name: users.name,
    created_at: qns_category.created_at,
    updated_at: qns_category.updated_at,
    remarks: qns_category.remarks,
  })
    .from(qns_category)
    .leftJoin(users, eq(users.uuid, qns_category.created_by));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.select({
    uuid: qns_category.uuid,
    name: qns_category.name,
    index: qns_category.index,
    min_percentage: PG_DECIMAL_TO_FLOAT(qns_category.min_percentage),
    created_by: qns_category.created_by,
    created_by_name: users.name,
    created_at: qns_category.created_at,
    updated_at: qns_category.updated_at,
    remarks: qns_category.remarks,
  })
    .from(qns_category)
    .leftJoin(users, eq(users.uuid, qns_category.created_by))
    .where(eq(qns_category.uuid, uuid));

  if (!data)
    return DataNotFound(c);

  return c.json(data, HSCode.OK);
};
