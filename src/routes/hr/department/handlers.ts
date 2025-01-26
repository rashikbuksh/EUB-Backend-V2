import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HttpStatus from 'stoker/http-status-codes';

import db from '@/db';
import { returnEmptyObject, returnNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department } from '../schema';

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const department = await db.query.department.findMany();
  return c.json(department);
};

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');
  const [inserted] = await db.insert(department).values(value).returning();
  return c.json(inserted, HttpStatus.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const value = await db.query.department.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  returnNotFound(!value, c);

  return c.json(value, HttpStatus.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  returnEmptyObject(updates, c);

  const [result] = await db.update(department)
    .set(updates)
    .where(eq(department.uuid, uuid))
    .returning();

  returnNotFound(!result, c);

  return c.json(result, HttpStatus.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const result = await db.delete(department)
    .where(eq(department.uuid, uuid));

  returnNotFound(result.rowCount === 0, c);

  return c.body(result, HttpStatus.NO_CONTENT);
};
