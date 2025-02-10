import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { contact_us } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(contact_us).values(value).returning({
    name: contact_us.id,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { id } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(contact_us)
    .set(updates)
    .where(eq(contact_us.id, id))
    .returning({
      name: contact_us.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { id } = c.req.valid('param');

  const [data] = await db.delete(contact_us)
    .where(eq(contact_us.id, id))
    .returning({
      name: contact_us.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.contact_us.findMany();
  const resultPromise = db.select({
    id: contact_us.id,
    full_name: contact_us.full_name,
    email: contact_us.email,
    question: contact_us.question,
    description: contact_us.description,
    created_at: contact_us.created_at,
    updated_at: contact_us.updated_at,
  })
    .from(contact_us);

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { id } = c.req.valid('param');

  const data = await db.query.contact_us.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
