import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { item, purchase_cost_center } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(item).values(value).returning({
    name: item.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(item)
    .set(updates)
    .where(eq(item.uuid, uuid))
    .returning({
      name: item.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(item)
    .where(eq(item.uuid, uuid))
    .returning({
      name: item.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    index: item.index,
    uuid: item.uuid,
    purchase_cost_center_uuid: item.purchase_cost_center_uuid,
    purchase_cost_center_name: purchase_cost_center.name,
    name: item.name,
    vendor_price: PG_DECIMAL_TO_FLOAT(item.vendor_price),
    price_validity: item.price_validity,
    created_at: item.created_at,
    updated_at: item.updated_at,
    created_by: item.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item.remarks,
  })
    .from(item)
    .leftJoin(hrSchema.users, eq(item.created_by, hrSchema.users.uuid))
    .leftJoin(purchase_cost_center, eq(item.purchase_cost_center_uuid, purchase_cost_center.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    index: item.index,
    uuid: item.uuid,
    purchase_cost_center_uuid: item.purchase_cost_center_uuid,
    purchase_cost_center_name: purchase_cost_center.name,
    name: item.name,
    vendor_price: PG_DECIMAL_TO_FLOAT(item.vendor_price),
    price_validity: item.price_validity,
    created_at: item.created_at,
    updated_at: item.updated_at,
    created_by: item.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item.remarks,
  })
    .from(item)
    .leftJoin(hrSchema.users, eq(item.created_by, hrSchema.users.uuid))
    .leftJoin(purchase_cost_center, eq(item.purchase_cost_center_uuid, purchase_cost_center.uuid))
    .where(eq(item.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
