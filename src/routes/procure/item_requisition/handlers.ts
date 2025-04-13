import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { item, item_requisition, requisition } from '../schema';

// const authorized_person = alias(hrSchema.users, 'authorized_person');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(item_requisition).values(value).returning({
    name: item_requisition.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(item_requisition)
    .set(updates)
    .where(eq(item_requisition.uuid, uuid))
    .returning({
      name: item_requisition.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(item_requisition)
    .where(eq(item_requisition.uuid, uuid))
    .returning({
      name: item_requisition.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { item_requisition } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: item_requisition.uuid,
    item_uuid: item_requisition.item_uuid,
    item_name: item.name,
    requisition_uuid: item_requisition.requisition_uuid,
    requisition_department: requisition.department,
    req_quantity: PG_DECIMAL_TO_FLOAT(item_requisition.req_quantity),
    provided_quantity: PG_DECIMAL_TO_FLOAT(item_requisition.provided_quantity),
    created_at: item_requisition.created_at,
    updated_at: item_requisition.updated_at,
    created_by: item_requisition.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_requisition.remarks,

  })
    .from(item_requisition)
    .leftJoin(hrSchema.users, eq(item_requisition.created_by, hrSchema.users.uuid))
    .leftJoin(item, eq(item_requisition.item_uuid, item.uuid))
    .leftJoin(requisition, eq(item_requisition.requisition_uuid, requisition.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.item_requisition.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
