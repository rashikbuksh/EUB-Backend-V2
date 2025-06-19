import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { generateDynamicId } from '@/lib/dynamic_id';
// import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
// import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { bank, bill, vendor } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const newId = await generateDynamicId(bank, bank.uuid, bank.created_at);

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
    vendor_uuid: bill.vendor_uuid,
    vendor_name: vendor.name,
    bank_uuid: bill.bank_uuid,
    bank_name: bank.name,
    created_at: bill.created_at,
    updated_at: bill.updated_at,
    created_by: bill.created_by,
    created_by_name: hrSchema.users.name,
    remarks: bill.remarks,
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
