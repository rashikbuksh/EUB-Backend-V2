import type { AppRouteHandler } from '@/lib/types';

import { desc, eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { purchase_cost_center, sub_category } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(purchase_cost_center).values(value).returning({
    name: purchase_cost_center.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(purchase_cost_center)
    .set(updates)
    .where(eq(purchase_cost_center.uuid, uuid))
    .returning({
      name: purchase_cost_center.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(purchase_cost_center)
    .where(eq(purchase_cost_center.uuid, uuid))
    .returning({
      name: purchase_cost_center.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    index: purchase_cost_center.index,
    uuid: purchase_cost_center.uuid,
    sub_category_uuid: purchase_cost_center.sub_category_uuid,
    sub_category_name: sub_category.name,
    sub_category_type: sub_category.type,
    name: purchase_cost_center.name,
    from: purchase_cost_center.from,
    to: purchase_cost_center.to,
    budget: PG_DECIMAL_TO_FLOAT(purchase_cost_center.budget),
    created_at: purchase_cost_center.created_at,
    updated_at: purchase_cost_center.updated_at,
    created_by: purchase_cost_center.created_by,
    created_by_name: hrSchema.users.name,
    remarks: purchase_cost_center.remarks,

  })
    .from(purchase_cost_center)
    .leftJoin(hrSchema.users, eq(purchase_cost_center.created_by, hrSchema.users.uuid))
    .leftJoin(sub_category, eq(purchase_cost_center.sub_category_uuid, sub_category.uuid))
    .orderBy(desc(purchase_cost_center.created_at));

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
    index: purchase_cost_center.index,
    uuid: purchase_cost_center.uuid,
    sub_category_uuid: purchase_cost_center.sub_category_uuid,
    sub_category_name: sub_category.name,
    sub_category_type: sub_category.type,
    name: purchase_cost_center.name,
    from: purchase_cost_center.from,
    to: purchase_cost_center.to,
    budget: PG_DECIMAL_TO_FLOAT(purchase_cost_center.budget),
    created_at: purchase_cost_center.created_at,
    updated_at: purchase_cost_center.updated_at,
    created_by: purchase_cost_center.created_by,
    created_by_name: hrSchema.users.name,
    remarks: purchase_cost_center.remarks,

  })
    .from(purchase_cost_center)
    .leftJoin(hrSchema.users, eq(purchase_cost_center.created_by, hrSchema.users.uuid))
    .leftJoin(sub_category, eq(purchase_cost_center.sub_category_uuid, sub_category.uuid))
    .where(eq(purchase_cost_center.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
