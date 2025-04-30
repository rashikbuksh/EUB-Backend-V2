import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { service, service_payment } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(service_payment).values(value).returning({
    name: service_payment.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(service_payment)
    .set(updates)
    .where(eq(service_payment.uuid, uuid))
    .returning({
      name: service_payment.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(service_payment)
    .where(eq(service_payment.uuid, uuid))
    .returning({
      name: service_payment.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: service_payment.uuid,
    service_uuid: service_payment.service_uuid,
    service_name: service.name,
    amount: PG_DECIMAL_TO_FLOAT(service_payment.amount),
    payment_date: service_payment.payment_date,
    created_at: service_payment.created_at,
    updated_at: service_payment.updated_at,
    created_by: service_payment.created_by,
    created_by_name: hrSchema.users.name,
    remarks: service_payment.remarks,
    next_due_date: service_payment.next_due_date,
  })
    .from(service_payment)
    .leftJoin(hrSchema.users, eq(service_payment.created_by, hrSchema.users.uuid))
    .leftJoin(service, eq(service_payment.service_uuid, service.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.service_payment.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
