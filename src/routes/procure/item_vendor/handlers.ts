import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { item, item_vendor, vendor } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(item_vendor).values(value).returning({
    name: item_vendor.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(item_vendor)
    .set(updates)
    .where(eq(item_vendor.uuid, uuid))
    .returning({
      name: item_vendor.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(item_vendor)
    .where(eq(item_vendor.uuid, uuid))
    .returning({
      name: item_vendor.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { item_uuid } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: item_vendor.uuid,
    item_uuid: item_vendor.item_uuid,
    item_name: item.name,
    vendor_uuid: item_vendor.vendor_uuid,
    vendor_name: vendor.name,
    is_active: item_vendor.is_active,
    created_at: item_vendor.created_at,
    updated_at: item_vendor.updated_at,
    created_by: item_vendor.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_vendor.remarks,
  })
    .from(item_vendor)
    .leftJoin(hrSchema.users, eq(item_vendor.created_by, hrSchema.users.uuid))
    .leftJoin(item, eq(item_vendor.item_uuid, item.uuid))
    .leftJoin(vendor, eq(item_vendor.vendor_uuid, vendor.uuid));

  if (item_uuid) {
    resultPromise.where(
      eq(item_vendor.item_uuid, item_uuid),
    );
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.item_vendor.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
