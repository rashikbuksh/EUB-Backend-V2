import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
// import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { bill, bill_payment } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(bill_payment).values(value).returning({
    name: bill_payment.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(bill_payment)
    .set(updates)
    .where(eq(bill_payment.uuid, uuid))
    .returning({
      name: bill_payment.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(bill_payment)
    .where(eq(bill_payment.uuid, uuid))
    .returning({
      name: bill_payment.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: bill_payment.uuid,
    bill_uuid: bill_payment.bill_uuid,
    type: bill_payment.type,
    amount: PG_DECIMAL_TO_FLOAT(bill_payment.amount),
    created_at: bill_payment.created_at,
    updated_at: bill_payment.updated_at,
    created_by: bill_payment.created_by,
    created_by_name: hrSchema.users.name,
    remarks: bill_payment.remarks,
    payment_method: bill_payment.payment_method,
    payment_date: bill_payment.payment_date,
  })
    .from(bill_payment)
    .leftJoin(bill, eq(bill_payment.bill_uuid, bill.uuid))
    .leftJoin(hrSchema.users, eq(bill_payment.created_by, hrSchema.users.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.bill_payment.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
