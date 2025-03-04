import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { service, sub_category } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(service).values(value).returning({
    name: service.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(service)
    .set(updates)
    .where(eq(service.uuid, uuid))
    .returning({
      name: service.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(service)
    .where(eq(service.uuid, uuid))
    .returning({
      name: service.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    index: service.index,
    uuid: service.uuid,
    sub_category_uuid: service.sub_category_uuid,
    sub_category_name: sub_category.name,
    sub_category_type: sub_category.type,
    name: service.name,
    is_quotation: service.is_quotation,
    is_cs: service.is_cs,
    cs_remarks: service.cs_remarks,
    is_monthly_meeting: service.is_monthly_meeting,
    monthly_meeting_remarks: service.monthly_meeting_remarks,
    is_work_order: service.is_work_order,
    work_order_remarks: service.work_order_remarks,
    is_delivery_statement: service.is_delivery_statement,
    delivery_statement_remarks: service.delivery_statement_remarks,
    done: service.done,
    created_at: service.created_at,
    updated_at: service.updated_at,
    created_by: service.created_by,
    created_by_name: hrSchema.users.name,
    remarks: service.remarks,

  })
    .from(service)
    .leftJoin(hrSchema.users, eq(service.created_by, hrSchema.users.uuid))
    .leftJoin(sub_category, eq(service.sub_category_uuid, sub_category.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.service.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
