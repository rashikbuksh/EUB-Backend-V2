import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HttpStatus from 'stoker/http-status-codes';

import db from '@/db';
import { returnEmptyObject, returnNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { designation } from '../schema';

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const designation = await db.query.designation.findMany();
  return c.json(designation);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const value = c.req.valid('json');
  const [inserted] = await db.insert(designation).values(value).returning();
  return c.json(inserted, HttpStatus.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { uuid } = c.req.valid('param');
  const result = await db.query.designation.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  returnNotFound(!result, c);

  return c.json(result, HttpStatus.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  returnEmptyObject(updates, c);

  const [result] = await db.update(designation)
    .set(updates)
    .where(eq(designation.uuid, uuid))
    .returning();

  returnNotFound(!result, c);

  return c.json(result, HttpStatus.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { uuid } = c.req.valid('param');
  const result = await db.delete(designation)
    .where(eq(designation.uuid, uuid));

  returnNotFound(result.rowCount === 0, c);

  return c.body(null, HttpStatus.NO_CONTENT);
};
