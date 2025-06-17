import type { AppRouteHandler } from '@/lib/types';

import { asc, eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { qns, qns_category } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(qns).values(value).returning({
    name: qns.name,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(qns)
    .set(updates)
    .where(eq(qns.uuid, uuid))
    .returning({
      name: qns.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(qns)
    .where(eq(qns.uuid, uuid))
    .returning({
      name: qns.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.qns.findMany();
  const { is_active } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: qns.uuid,
    qns_category_uuid: qns.qns_category_uuid,
    qns_category_name: qns_category.name,
    name: qns.name,
    index: qns.index,
    active: qns.active,
    created_by: qns.created_by,
    created_by_name: users.name,
    created_at: qns.created_at,
    updated_at: qns.updated_at,
    remarks: qns.remarks,
  })
    .from(qns)
    .leftJoin(qns_category, eq(qns_category.uuid, qns.qns_category_uuid))
    .leftJoin(users, eq(users.uuid, qns.created_by))
    .orderBy(asc(qns.index));

  if (is_active !== undefined) {
    resultPromise.where(eq(qns.active, is_active));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.select({
    uuid: qns.uuid,
    qns_category_uuid: qns.qns_category_uuid,
    qns_category_name: qns_category.name,
    name: qns.name,
    index: qns.index,
    active: qns.active,
    created_by: qns.created_by,
    created_by_name: users.name,
    created_at: qns.created_at,
    updated_at: qns.updated_at,
    remarks: qns.remarks,
  })
    .from(qns)
    .leftJoin(qns_category, eq(qns_category.uuid, qns.qns_category_uuid))
    .leftJoin(users, eq(users.uuid, qns.created_by))
    .where(eq(qns.uuid, uuid));

  if (!data)
    return DataNotFound(c);

  return c.json(data, HSCode.OK);
};
