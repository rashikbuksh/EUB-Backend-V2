import type { AppRouteHandler } from '@/lib/types';

import { desc, eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
// import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { purchase_cost_center, sub_purchase_cost_center } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(sub_purchase_cost_center).values(value).returning({
    name: sub_purchase_cost_center.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(sub_purchase_cost_center)
    .set(updates)
    .where(eq(sub_purchase_cost_center.uuid, uuid))
    .returning({
      name: sub_purchase_cost_center.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(sub_purchase_cost_center)
    .where(eq(sub_purchase_cost_center.uuid, uuid))
    .returning({
      name: sub_purchase_cost_center.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: sub_purchase_cost_center.uuid,
    index: sub_purchase_cost_center.index,
    name: sub_purchase_cost_center.name,
    purchase_cost_center_uuid: sub_purchase_cost_center.purchase_cost_center_uuid,
    purchase_cost_center_name: purchase_cost_center.name,
    created_at: sub_purchase_cost_center.created_at,
    updated_at: sub_purchase_cost_center.updated_at,
    created_by: sub_purchase_cost_center.created_by,
    created_by_name: hrSchema.users.name,
    remarks: sub_purchase_cost_center.remarks,
  })
    .from(sub_purchase_cost_center)
    .leftJoin(hrSchema.users, eq(sub_purchase_cost_center.created_by, hrSchema.users.uuid))
    .leftJoin(purchase_cost_center, eq(purchase_cost_center.uuid, sub_purchase_cost_center.purchase_cost_center_uuid))
    .orderBy(desc(sub_purchase_cost_center.created_at));

  const data = await resultPromise;

  // Generate an array of indices based on the length of the data
  const dataWithIndex = data.map((item, index) => ({
    ...item,
    index,
  }));

  return c.json(dataWithIndex || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: sub_purchase_cost_center.uuid,
    index: sub_purchase_cost_center.index,
    name: sub_purchase_cost_center.name,
    purchase_cost_center_uuid: sub_purchase_cost_center.purchase_cost_center_uuid,
    purchase_cost_center_name: purchase_cost_center.name,
    created_at: sub_purchase_cost_center.created_at,
    updated_at: sub_purchase_cost_center.updated_at,
    created_by: sub_purchase_cost_center.created_by,
    created_by_name: hrSchema.users.name,
    remarks: sub_purchase_cost_center.remarks,
  })
    .from(sub_purchase_cost_center)
    .leftJoin(hrSchema.users, eq(sub_purchase_cost_center.created_by, hrSchema.users.uuid))
    .leftJoin(purchase_cost_center, eq(purchase_cost_center.uuid, sub_purchase_cost_center.purchase_cost_center_uuid))
    .where(eq(sub_purchase_cost_center.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
