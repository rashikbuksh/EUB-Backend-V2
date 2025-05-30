import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { generateDynamicId } from '@/lib/dynamic_id';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, GetWorkOrderDEtailsByWorkOrderUuidRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { item_work_order, vendor } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const newId = await generateDynamicId(item_work_order, item_work_order.id, item_work_order.created_at);

  const [data] = await db.insert(item_work_order).values({
    id: newId,
    ...value,
  }).returning({
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
    id: item_work_order.id,
    item_work_order_id: sql`CONCAT('IWOI', TO_CHAR(${item_work_order.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order.id}, 'FM0000'))`,
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

export const getWorkOrderDEtailsByWorkOrderUuid: AppRouteHandler<GetWorkOrderDEtailsByWorkOrderUuidRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.item_work_order.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  //   with: {
  //     item_work_order_entry: {
  //       extras: {
  //         quantity: PG_DECIMAL_TO_FLOAT(sql`${item_work_order_entry}.quantity`).as('quantity'),
  //         unit_price: PG_DECIMAL_TO_FLOAT(sql`${item_work_order_entry}.unit_price`).as('unit_price'),
  //         name: sql`(SELECT item.name FROM procure.item WHERE item.uuid = ${sql`${item_work_order_entry}.item_uuid`})`.as('name'),
  //       },
  //       orderBy: (item_work_order_entry, { asc }) => [asc(item_work_order_entry.created_at)],
  //     },
  //   },
  // });

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
    item_work_order_entry: sql`COALESCE(ARRAY(SELECT json_build_object(
        'uuid', item_work_order_entry.uuid,
        'item_work_uuid', item_work_order_entry.item_work_order_uuid,
        'item_uuid', item_work_order_entry.item_uuid,
        'item_name', item.name,
        'quantity', item_work_order_entry.quantity::float8,
        'unit_price', item_work_order_entry.unit_price::float8,
        'is_received', item_work_order_entry.is_received,
        'received_date', item_work_order_entry.received_date,
        'created_by', item_work_order_entry.created_by,
        'created_at', item_work_order_entry.created_at,
        'updated_at', item_work_order_entry.updated_at,
        'remarks', item_work_order_entry.remarks
      )
      FROM procure.item_work_order_entry
      LEFT JOIN procure.item ON item_work_order_entry.item_uuid = item.uuid
      WHERE item_work_order_entry.item_work_order_uuid = ${item_work_order.uuid}
      ORDER BY item_work_order_entry.created_at ASC), '{}')`,
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
