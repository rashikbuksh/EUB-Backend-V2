import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { category } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(category).values(value).returning({
    name: category.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(category)
    .set(updates)
    .where(eq(category.uuid, uuid))
    .returning({
      name: category.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(category)
    .where(eq(category.uuid, uuid))
    .returning({
      name: category.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { category } = c.req.valid('query');

  const resultPromise = db.select({
    index: category.index,
    uuid: category.uuid,
    name: category.name,
    is_capital: category.is_capital,
    created_at: category.created_at,
    updated_at: category.updated_at,
    created_by: category.created_by,
    created_by_name: hrSchema.users.name,
    remarks: category.remarks,

  })
    .from(category)
    .leftJoin(hrSchema.users, eq(category.created_by, hrSchema.users.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.category.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
