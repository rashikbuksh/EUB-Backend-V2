import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { generateDynamicId } from '@/lib/dynamic_id';
// import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
// import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetBillAndBillPaymentDetailsByBillUuidRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { bank, bill, bill_payment, item_work_order, vendor } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const newId = await generateDynamicId(bill, bill.id, bill.created_at);

  const [data] = await db.insert(bill).values({
    id: newId,
    ...value,
  }).returning({
    name: bill.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(bill)
    .set(updates)
    .where(eq(bill.uuid, uuid))
    .returning({
      name: bill.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(bill)
    .where(eq(bill.uuid, uuid))
    .returning({
      name: bill.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: bill.uuid,
    id: bill.id,
    bill_id: sql`CONCAT('BI', TO_CHAR(${bill.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${bill.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${bill.id}, 'FM0000'))`,
    vendor_uuid: bill.vendor_uuid,
    vendor_name: vendor.name,
    bank_uuid: bill.bank_uuid,
    bank_name: bank.name,
    created_at: bill.created_at,
    updated_at: bill.updated_at,
    created_by: bill.created_by,
    created_by_name: hrSchema.users.name,
    remarks: bill.remarks,
    is_completed: bill.is_completed,
  })
    .from(bill)
    .leftJoin(bank, eq(bill.bank_uuid, bank.uuid))
    .leftJoin(vendor, eq(bill.vendor_uuid, vendor.uuid))
    .leftJoin(hrSchema.users, eq(bill.created_by, hrSchema.users.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.bill.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};

export const getBillAndBillPaymentDetailsByBillUuid: AppRouteHandler<GetBillAndBillPaymentDetailsByBillUuidRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: bill.uuid,
    id: bill.id,
    bill_id: sql`CONCAT('BI', TO_CHAR(${bill.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${bill.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${bill.id}, 'FM0000'))`,
    vendor_uuid: bill.vendor_uuid,
    vendor_name: vendor.name,
    bank_uuid: bill.bank_uuid,
    bank_name: bank.name,
    created_at: bill.created_at,
    updated_at: bill.updated_at,
    created_by: bill.created_by,
    created_by_name: hrSchema.users.name,
    remarks: bill.remarks,
    is_completed: bill.is_completed,
    bill_payment: sql`(
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'uuid', bp.uuid,
            'bill_uuid', bp.bill_uuid,
            'amount', bp.amount::float8,
            'type', bp.type,
            'created_by', bp.created_by,
            'created_by_name', u.name,
            'created_at', bp.created_at,
            'updated_at', bp.updated_at,
            'remarks', bp.remarks
          )
        ), '[]'::json
      )
      FROM procure.bill_payment bp
      LEFT JOIN hr.users u ON u.uuid = bp.created_by
      WHERE bp.bill_uuid = ${bill.uuid}
    )`,
    item_work_order: sql`(
     SELECT COALESCE(
        json_agg(
          json_build_object(
            'uuid', iwo.uuid
          )
        ), '[]'::json
      )
      FROM procure.item_work_order iwo
      WHERE iwo.bill_uuid = ${bill.uuid}
    )`,
  })
    .from(bill)
    .leftJoin(bank, eq(bill.bank_uuid, bank.uuid))
    .leftJoin(vendor, eq(bill.vendor_uuid, vendor.uuid))
    .leftJoin(bill_payment, eq(bill.uuid, bill_payment.bill_uuid))
    .leftJoin(item_work_order, eq(item_work_order.bill_uuid, bill.uuid))
    .leftJoin(hrSchema.users, eq(bill.created_by, hrSchema.users.uuid))
    .where(eq(bill.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
