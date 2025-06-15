import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, GetQnsCategoryAndQnsDetailsRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

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

export const getQnsCategoryAndQnsDetails: AppRouteHandler<GetQnsCategoryAndQnsDetailsRoute> = async (c: any) => {
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
    qns: sql`COALESCE(ARRAY(
          SELECT jsonb_build_object(
            'uuid', qns.uuid,
            'name', qns.name,
            'index', qns.index,
            'active', qns.active,
            'created_by', qns.created_by,
            'created_by_name', users.name,
            'created_at', qns.created_at,
            'updated_at', qns.updated_at,
            'remarks', qns.remarks
          )
          FROM fde.qns
          WHERE qns.qns_category_uuid = ${qns_category.uuid} AND qns.active = true
        ), ARRAY[]::jsonb[])`.as('qns'),
  })
    .from(qns_category)
    .leftJoin(users, eq(users.uuid, qns_category.created_by))
    .orderBy(qns_category.index);

  const data = await resultPromise;

  if (!data || data.length === 0)
    return DataNotFound(c);

  // const transformed = data.map((row) => {
  //   const { qns, name, ...rest } = row;
  //   return {
  //     ...rest,
  //     name,
  //     [String(name)]: qns,
  //   };
  // });

  return c.json(data, HSCode.OK);
};
