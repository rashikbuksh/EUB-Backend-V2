import type { AppRouteHandler } from '@/lib/types';

import { and, eq, sql } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetItemByVendorUuidRoute, GetItemDetailsByItemUuidRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { item, item_vendor, purchase_cost_center, sub_purchase_cost_center, vendor } from '../schema';

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
  const { vendor_uuid } = c.req.valid('query');

  const baseFields = {
    index: item.index,
    uuid: item.uuid,
    purchase_cost_center_uuid: item.purchase_cost_center_uuid,
    purchase_cost_center_name: purchase_cost_center.name,
    name: item.name,
    quantity: PG_DECIMAL_TO_FLOAT(item.quantity),
    vendor_price: PG_DECIMAL_TO_FLOAT(item.vendor_price),
    price_validity: item.price_validity,
    created_at: item.created_at,
    updated_at: item.updated_at,
    created_by: item.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item.remarks,
    unit: item.unit,
    sub_purchase_cost_center_uuid: item.sub_purchase_cost_center_uuid,
    sub_purchase_cost_center_name: sub_purchase_cost_center.name,
  };

  const query = db
    .select(vendor_uuid ? { ...baseFields, vendor_uuid: item_vendor.vendor_uuid, vendor_name: vendor.name, is_active: item_vendor.is_active } : baseFields)
    .from(item)
    .leftJoin(hrSchema.users, eq(item.created_by, hrSchema.users.uuid))
    .leftJoin(purchase_cost_center, eq(item.purchase_cost_center_uuid, purchase_cost_center.uuid))
    .leftJoin(sub_purchase_cost_center, eq(item.sub_purchase_cost_center_uuid, sub_purchase_cost_center.uuid));

  if (vendor_uuid) {
    query
      .leftJoin(item_vendor, eq(item.uuid, item_vendor.item_uuid))
      .leftJoin(vendor, eq(item_vendor.vendor_uuid, vendor.uuid))
      .where(eq(vendor.uuid, vendor_uuid));
  }

  const data = await query;

  if (!data)
    return DataNotFound(c);

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
    quantity: PG_DECIMAL_TO_FLOAT(item.quantity),
    vendor_price: PG_DECIMAL_TO_FLOAT(item.vendor_price),
    price_validity: item.price_validity,
    created_at: item.created_at,
    updated_at: item.updated_at,
    created_by: item.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item.remarks,
    unit: item.unit,
    sub_purchase_cost_center_uuid: item.sub_purchase_cost_center_uuid,
    sub_purchase_cost_center_name: sub_purchase_cost_center.name,
  })
    .from(item)
    .leftJoin(hrSchema.users, eq(item.created_by, hrSchema.users.uuid))
    .leftJoin(purchase_cost_center, eq(item.purchase_cost_center_uuid, purchase_cost_center.uuid))
    .leftJoin(sub_purchase_cost_center, eq(item.sub_purchase_cost_center_uuid, sub_purchase_cost_center.uuid))
    .where(eq(item.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};

export const getItemDetailsByItemUuid: AppRouteHandler<GetItemDetailsByItemUuidRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const data = await db.query.item.findFirst({
    extras: {
      quantity: PG_DECIMAL_TO_FLOAT(item.quantity).as('quantity'),
      vendor_price: PG_DECIMAL_TO_FLOAT(item.vendor_price).as('vendor_price'),
    },
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
    with: {
      vendors: {
        orderBy: (vendors, { asc }) => [asc(vendors.created_at)],
      },
    },

  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};

export const getItemByVendorUuid: AppRouteHandler<GetItemByVendorUuidRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const { is_active } = c.req.valid('query') || 'false';

  const resultPromise = db.select({
    value: item.uuid,
    label: item.name,
    index: item.index,
    purchase_cost_center_uuid: item.purchase_cost_center_uuid,
    purchase_cost_center_name: purchase_cost_center.name,
    quantity: PG_DECIMAL_TO_FLOAT(item.quantity),
    unit_price: PG_DECIMAL_TO_FLOAT(item.vendor_price),
    price_validity: item.price_validity,
    created_at: item.created_at,
    updated_at: item.updated_at,
    created_by: item.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item.remarks,
    unit: item.unit,
    sub_purchase_cost_center_uuid: item.sub_purchase_cost_center_uuid,
    sub_purchase_cost_center_name: sub_purchase_cost_center.name,
  })
    .from(item)
    .leftJoin(hrSchema.users, eq(item.created_by, hrSchema.users.uuid))
    .leftJoin(purchase_cost_center, eq(item.purchase_cost_center_uuid, purchase_cost_center.uuid))
    .leftJoin(sub_purchase_cost_center, eq(item.sub_purchase_cost_center_uuid, sub_purchase_cost_center.uuid))
    .leftJoin(item_vendor, eq(item.uuid, item_vendor.item_uuid))
    .where(and(eq(item_vendor.vendor_uuid, uuid), is_active === 'true' ? eq(item_vendor.is_active, true) : sql`true`));

  const data = await resultPromise;
  if (!data)
    return DataNotFound(c);

  return c.json(data || [], HSCode.OK);
};
