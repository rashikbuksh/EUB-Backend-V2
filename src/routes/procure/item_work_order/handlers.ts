import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { item_work_order, vendor } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(item_work_order).values(value).returning({
    name: item_work_order.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(item_work_order)
    .set(updates)
    .where(eq(item_work_order.uuid, uuid))
    .returning({
      name: item_work_order.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(item_work_order)
    .where(eq(item_work_order.uuid, uuid))
    .returning({
      name: item_work_order.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: item_work_order.uuid,
    vendor_uuid: item_work_order.vendor_uuid,
    vendor_name: vendor.name,
    status: item_work_order.status,
    created_at: item_work_order.created_at,
    updated_at: item_work_order.updated_at,
    created_by: item_work_order.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_work_order.remarks,
  })
    .from(item_work_order)
    .leftJoin(hrSchema.users, eq(item_work_order.created_by, hrSchema.users.uuid))
    .leftJoin(vendor, eq(item_work_order.vendor_uuid, vendor
      .uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: item_work_order.uuid,
    vendor_uuid: item_work_order.vendor_uuid,
    vendor_name: vendor.name,
    status: item_work_order.status,
    created_at: item_work_order.created_at,
    updated_at: item_work_order.updated_at,
    created_by: item_work_order.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_work_order.remarks,
  })
    .from(item_work_order)
    .leftJoin(hrSchema.users, eq(item_work_order.created_by, hrSchema.users.uuid))
    .leftJoin(vendor, eq(item_work_order.vendor_uuid, vendor.uuid))
    .where(eq(item_work_order.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
