import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { category, sub_category } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(sub_category).values(value).returning({
    name: sub_category.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(sub_category)
    .set(updates)
    .where(eq(sub_category.uuid, uuid))
    .returning({
      name: sub_category.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(sub_category)
    .where(eq(sub_category.uuid, uuid))
    .returning({
      name: sub_category.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    index: sub_category.index,
    uuid: sub_category.uuid,
    category_uuid: sub_category.category_uuid,
    name: category.name,
    type: sub_category.type,
    min_amount: PG_DECIMAL_TO_FLOAT(sub_category.min_amount),
    min_quotation: PG_DECIMAL_TO_FLOAT(sub_category.min_quotation),
    created_at: sub_category.created_at,
    updated_at: sub_category.updated_at,
    created_by: sub_category.created_by,
    created_by_name: hrSchema.users.name,
    remarks: sub_category.remarks,

  })
    .from(sub_category)
    .leftJoin(hrSchema.users, eq(sub_category.created_by, hrSchema.users.uuid))
    .leftJoin(category, eq(sub_category.category_uuid, category.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.sub_category.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
