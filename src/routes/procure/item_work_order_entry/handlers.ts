import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetAllByUuidRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { capital, item, item_work_order, item_work_order_entry } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(item_work_order_entry).values(value).returning({
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
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: item_work_order_entry.uuid,
    item_work_order_uuid: item_work_order_entry.item_work_order_uuid,
    item_work_order_id: sql`CONCAT('IWOI', TO_CHAR(${item_work_order.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order.id}, 'FM0000'))`,
    item_uuid: item_work_order_entry.item_uuid,
    item_name: item.name,
    quantity: PG_DECIMAL_TO_FLOAT(item_work_order_entry.quantity),
    unit_price: PG_DECIMAL_TO_FLOAT(item_work_order_entry.unit_price),
    is_received: item_work_order_entry.is_received,
    created_at: item_work_order_entry.created_at,
    updated_at: item_work_order_entry.updated_at,
    created_by: item_work_order_entry.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_work_order_entry.remarks,
    received_date: item_work_order_entry.received_date,
    capital_uuid: item_work_order_entry.capital_uuid,
    capital_name: capital.name,
  })
    .from(item_work_order_entry)
    .leftJoin(hrSchema.users, eq(item_work_order_entry.created_by, hrSchema.users.uuid))
    .leftJoin(item_work_order, eq(item_work_order_entry.item_work_order_uuid, item_work_order.uuid))
    .leftJoin(item, eq(item_work_order_entry.item_uuid, item.uuid))
    .leftJoin(capital, eq(item_work_order_entry.capital_uuid, capital.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: item_work_order_entry.uuid,
    item_work_order_uuid: item_work_order_entry.item_work_order_uuid,
    item_work_order_id: sql`CONCAT('IWOI', TO_CHAR(${item_work_order.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order.id}, 'FM0000'))`,
    item_uuid: item_work_order_entry.item_uuid,
    item_name: item.name,
    quantity: PG_DECIMAL_TO_FLOAT(item_work_order_entry.quantity),
    unit_price: PG_DECIMAL_TO_FLOAT(item_work_order_entry.unit_price),
    is_received: item_work_order_entry.is_received,
    created_at: item_work_order_entry.created_at,
    updated_at: item_work_order_entry.updated_at,
    created_by: item_work_order_entry.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_work_order_entry.remarks,
    received_date: item_work_order_entry.received_date,
    capital_uuid: item_work_order_entry.capital_uuid,
    capital_name: capital.name,
  })
    .from(item_work_order_entry)
    .leftJoin(hrSchema.users, eq(item_work_order_entry.created_by, hrSchema.users.uuid))
    .leftJoin(item_work_order, eq(item_work_order_entry.item_work_order_uuid, item_work_order.uuid))
    .leftJoin(item, eq(item_work_order_entry.item_uuid, item.uuid))
    .leftJoin(capital, eq(item_work_order_entry.capital_uuid, capital.uuid))
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
    item_work_order_id: sql`CONCAT('IWOI', TO_CHAR(${item_work_order.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order.id}, 'FM0000'))`,
    item_uuid: item_work_order_entry.item_uuid,
    item_name: item.name,
    quantity: PG_DECIMAL_TO_FLOAT(item_work_order_entry.quantity),
    unit_price: PG_DECIMAL_TO_FLOAT(item_work_order_entry.unit_price),
    is_received: item_work_order_entry.is_received,
    created_at: item_work_order_entry.created_at,
    updated_at: item_work_order_entry.updated_at,
    created_by: item_work_order_entry.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_work_order_entry.remarks,
    received_date: item_work_order_entry.received_date,
    capital_uuid: item_work_order_entry.capital_uuid,
    capital_name: capital.name,
  })
    .from(item_work_order_entry)
    .leftJoin(hrSchema.users, eq(item_work_order_entry.created_by, hrSchema.users.uuid))
    .leftJoin(item_work_order, eq(item_work_order_entry.item_work_order_uuid, item_work_order.uuid))
    .leftJoin(item, eq(item_work_order_entry.item_uuid, item.uuid))
    .leftJoin(capital, eq(item_work_order_entry.capital_uuid, capital.uuid))
    .where(eq(item_work_order_entry.item_work_order_uuid, item_work_order_uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
