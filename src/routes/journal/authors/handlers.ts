import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { authors } from '../schema';

const updatedByUser = alias(users, 'updated_by_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(authors).values(value).returning({
    name: authors.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(authors)
    .set(updates)
    .where(eq(authors.uuid, uuid))
    .returning({
      name: authors.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(authors)
    .where(eq(authors.uuid, uuid))
    .returning({
      name: authors.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.authors.findMany();
  const resultPromise = db.select({
    uuid: authors.uuid,
    name: authors.name,
    created_by: authors.created_by,
    created_by_name: users.name,
    created_at: authors.created_at,
    update_by: authors.updated_by,
    updated_by_name: updatedByUser.name,
    updated_at: authors.updated_at,
    remarks: authors.remarks,
    author_id: sql`REPLACE(LOWER(${authors.name}::text), ' ', '-')`.as('author_id'),
  })
    .from(authors)
    .leftJoin(users, eq(users.uuid, authors.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, authors.updated_by));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.select({
    uuid: authors.uuid,
    name: authors.name,
    created_by: authors.created_by,
    created_by_name: users.name,
    created_at: authors.created_at,
    update_by: authors.updated_by,
    updated_by_name: updatedByUser.name,
    updated_at: authors.updated_at,
    remarks: authors.remarks,
  })
    .from(authors)
    .leftJoin(users, eq(users.uuid, authors.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, authors.updated_by))
    .where(eq(authors.uuid, uuid));

  if (!data)
    return DataNotFound(c);

  return c.json(data, HSCode.OK);
};
