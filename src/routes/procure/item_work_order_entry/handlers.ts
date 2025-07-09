import type { AppRouteHandler } from '@/lib/types';

import { eq, isNotNull, isNull, sql } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { generateDynamicId } from '@/lib/dynamic_id';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetAllByUuidRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { item, item_work_order, item_work_order_entry } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');
  const newId = await generateDynamicId(item_work_order_entry, item_work_order_entry.id, item_work_order_entry.created_at);
  const [data] = await db.insert(item_work_order_entry).values({
    id: newId,
    ...value,
  }).returning({
    name: item_work_order_entry.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(item_work_order_entry)
    .set(updates)
    .where(eq(item_work_order_entry.uuid, uuid))
    .returning({
      name: item_work_order_entry.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(item_work_order_entry)
    .where(eq(item_work_order_entry.uuid, uuid))
    .returning({
      name: item_work_order_entry.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { status, store_type } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: item_work_order_entry.uuid,
    item_work_order_uuid: item_work_order_entry.item_work_order_uuid,
    item_work_order_id: sql`CONCAT('PS', TO_CHAR(${item_work_order.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order.id}, 'FM0000'))`,
    request_quantity: PG_DECIMAL_TO_FLOAT(item_work_order_entry.request_quantity),
    provided_quantity: PG_DECIMAL_TO_FLOAT(item_work_order_entry.provided_quantity),
    unit_price: PG_DECIMAL_TO_FLOAT(item_work_order_entry.unit_price),
    created_at: item_work_order_entry.created_at,
    updated_at: item_work_order_entry.updated_at,
    created_by: item_work_order_entry.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_work_order_entry.remarks,
    item_uuid: item_work_order_entry.item_uuid,
    item_name: item.name,
    store: item.store,
    item_work_entry_id: sql`CONCAT('IWOEI', TO_CHAR(${item_work_order_entry.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order_entry.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order_entry.id}, 'FM0000'))`,
    index: item_work_order_entry.index,
  })
    .from(item_work_order_entry)
    .leftJoin(item_work_order, eq(item_work_order_entry.item_work_order_uuid, item_work_order.uuid))
    .leftJoin(hrSchema.users, eq(item_work_order_entry.created_by, hrSchema.users.uuid))
    .leftJoin(item, eq(item_work_order_entry.item_uuid, item.uuid));

  if (status === 'pending') {
    resultPromise.where(isNull(item_work_order_entry.item_work_order_uuid));
  }
  if (status === 'complete') {
    resultPromise.where(isNotNull(item_work_order_entry.item_work_order_uuid));
  }
  if (store_type) {
    resultPromise.where(eq(item.store, store_type));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: item_work_order_entry.uuid,
    item_work_order_uuid: item_work_order_entry.item_work_order_uuid,
    item_work_order_id: sql`CONCAT('PS', TO_CHAR(${item_work_order.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order.id}, 'FM0000'))`,
    request_quantity: PG_DECIMAL_TO_FLOAT(item_work_order_entry.request_quantity),
    provided_quantity: PG_DECIMAL_TO_FLOAT(item_work_order_entry.provided_quantity),
    unit_price: PG_DECIMAL_TO_FLOAT(item_work_order_entry.unit_price),
    created_at: item_work_order_entry.created_at,
    updated_at: item_work_order_entry.updated_at,
    created_by: item_work_order_entry.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_work_order_entry.remarks,
    item_uuid: item_work_order_entry.item_uuid,
    item_name: item.name,
    store: item.store,
    index: item_work_order_entry.index,
  })
    .from(item_work_order_entry)
    .leftJoin(item_work_order, eq(item_work_order_entry.item_work_order_uuid, item_work_order.uuid))
    .leftJoin(hrSchema.users, eq(item_work_order_entry.created_by, hrSchema.users.uuid))
    .leftJoin(item, eq(item_work_order_entry.item_uuid, item.uuid))
    .where(eq(item_work_order_entry.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};

export const getAllByUuid: AppRouteHandler<GetAllByUuidRoute> = async (c: any) => {
  const { item_work_order_uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: item_work_order_entry.uuid,
    item_work_order_uuid: item_work_order_entry.item_work_order_uuid,
    item_work_order_id: sql`CONCAT('PS', TO_CHAR(${item_work_order.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order.id}, 'FM0000'))`,
    request_quantity: PG_DECIMAL_TO_FLOAT(item_work_order_entry.request_quantity),
    provided_quantity: PG_DECIMAL_TO_FLOAT(item_work_order_entry.provided_quantity),
    unit_price: PG_DECIMAL_TO_FLOAT(item_work_order_entry.unit_price),
    created_at: item_work_order_entry.created_at,
    updated_at: item_work_order_entry.updated_at,
    created_by: item_work_order_entry.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_work_order_entry.remarks,
    item_uuid: item_work_order_entry.item_uuid,
    item_name: item.name,
    store: item.store,
    index: item_work_order_entry.index,
  })
    .from(item_work_order_entry)
    .leftJoin(item_work_order, eq(item_work_order_entry.item_work_order_uuid, item_work_order.uuid))
    .leftJoin(hrSchema.users, eq(item_work_order_entry.created_by, hrSchema.users.uuid))
    .leftJoin(item, eq(item_work_order_entry.item_uuid, item.uuid))
    .where(eq(item_work_order_entry.uuid, item_work_order_uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
