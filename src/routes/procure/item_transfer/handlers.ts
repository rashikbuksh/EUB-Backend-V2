import type { AppRouteHandler } from '@/lib/types';

import { desc, eq, sql } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { item, item_transfer } from '../schema';

// const authorized_person = alias(hrSchema.users, 'authorized_person');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(item_transfer).values(value).returning({
    name: item_transfer.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(item_transfer)
    .set(updates)
    .where(eq(item_transfer.uuid, uuid))
    .returning({
      name: item_transfer.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(item_transfer)
    .where(eq(item_transfer.uuid, uuid))
    .returning({
      name: item_transfer.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { item_transfer } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: item_transfer.uuid,
    item_uuid: item_transfer.item_uuid,
    item_name: item.name,
    quantity: PG_DECIMAL_TO_FLOAT(item_transfer.quantity),
    reason: item_transfer.reason,
    is_requisition_received: item_transfer.is_requisition_received,
    created_at: item_transfer.created_at,
    updated_at: item_transfer.updated_at,
    created_by: item_transfer.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_transfer.remarks,
    max_quantity: sql`${PG_DECIMAL_TO_FLOAT(item.quantity)} + ${PG_DECIMAL_TO_FLOAT(item_transfer.quantity)}`,

  })
    .from(item_transfer)
    .leftJoin(hrSchema.users, eq(item_transfer.created_by, hrSchema.users.uuid))
    .leftJoin(item, eq(item_transfer.item_uuid, item.uuid))
    .orderBy(desc(item_transfer.created_at));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.item_transfer.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  // });

  const resultPromise = db.select({
    uuid: item_transfer.uuid,
    item_uuid: item_transfer.item_uuid,
    item_name: item.name,
    quantity: PG_DECIMAL_TO_FLOAT(item_transfer.quantity),
    reason: item_transfer.reason,
    is_requisition_received: item_transfer.is_requisition_received,
    created_at: item_transfer.created_at,
    updated_at: item_transfer.updated_at,
    created_by: item_transfer.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_transfer.remarks,
    max_quantity: sql`${PG_DECIMAL_TO_FLOAT(item.quantity)} + ${PG_DECIMAL_TO_FLOAT(item_transfer.quantity)}`,

  })
    .from(item_transfer)
    .leftJoin(hrSchema.users, eq(item_transfer.created_by, hrSchema.users.uuid))
    .leftJoin(item, eq(item_transfer.item_uuid, item.uuid))
    .where(eq(item_transfer.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
