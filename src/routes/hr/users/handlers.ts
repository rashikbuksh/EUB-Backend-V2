import type { AppRouteHandler } from '@/lib/types';
import type { JWTPayload } from 'hono/utils/jwt/types';

import { eq } from 'drizzle-orm';
import * as HttpStatus from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';

import db from '@/db';
import { ComparePass, CreateToken, HashPass } from '@/middlewares/auth';
import { returnEmptyObject, returnNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute, SigninRoute } from '../users/routes';

import { users } from '../schema';

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  console.warn('List users');

  const result = await db.query.users.findMany({
    with: {
      designation: true,
      department: true,
    },
  });
  return c.json(result);
};

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');
  const { pass } = await c.req.json();

  value.pass = await HashPass(pass);

  const [inserted] = await db.insert(users).values(value).returning();
  return c.json(inserted, HttpStatus.OK);
};

export const signin: AppRouteHandler<SigninRoute> = async (c: any) => {
  const updates = c.req.valid('json');

  returnEmptyObject(updates, c);

  const { email, pass } = await c.req.json();
  const result = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });

  if (!result) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatus.NOT_FOUND,
    );
  }

  if (!result.status) {
    return c.json(
      { message: 'Account is disabled' },
      HttpStatus.UNAUTHORIZED,
    );
  }

  const match = ComparePass(pass, result.pass);
  if (!match) {
    return c.json({ message: 'Email/Password does not match' }, HttpStatus.UNAUTHORIZED);
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    uuid: result.uuid,
    username: result.name,
    email: result.email,
    can_access: result.can_access,
    exp: now + 60 * 60 * 24,
  };

  const token = await CreateToken(payload);

  return c.json({ payload, token }, HttpStatus.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const result = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  returnNotFound(!result, c);

  return c.json(result, HttpStatus.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  returnEmptyObject(updates, c);

  const [result] = await db.update(users)
    .set(updates)
    .where(eq(users.uuid, uuid))
    .returning();

  returnNotFound(!result, c);

  return c.json(result, HttpStatus.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const result = await db.delete(users)
    .where(eq(users.uuid, uuid));

  returnNotFound(result.rowCount === 0, c);

  return c.body(null, HttpStatus.NO_CONTENT);
};
