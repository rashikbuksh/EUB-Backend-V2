import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { service, service_vendor, vendor } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(service_vendor).values(value).returning({
    name: service_vendor.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(service_vendor)
    .set(updates)
    .where(eq(service_vendor.uuid, uuid))
    .returning({
      name: service_vendor.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(service_vendor)
    .where(eq(service_vendor.uuid, uuid))
    .returning({
      name: service_vendor.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: service_vendor.uuid,
    service_uuid: service_vendor.service_uuid,
    service_name: service.name,
    vendor_uuid: service_vendor.vendor_uuid,
    vendor_name: vendor.name,
    amount: PG_DECIMAL_TO_FLOAT(service_vendor.amount),
    is_selected: service_vendor.is_selected,
    created_at: service_vendor.created_at,
    updated_at: service_vendor.updated_at,
    created_by: service_vendor.created_by,
    created_by_name: hrSchema.users.name,
    remarks: service_vendor.remarks,
  })
    .from(service_vendor)
    .leftJoin(hrSchema.users, eq(service_vendor.created_by, hrSchema.users.uuid))
    .leftJoin(service, eq(service_vendor.service_uuid, service.uuid))
    .leftJoin(vendor, eq(service_vendor.vendor_uuid, vendor.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.service_vendor.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
