import type { AppRouteHandler } from '@/lib/types';
import type { JWTPayload } from 'hono/utils/jwt/types';
import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute, SigninRoute } from '../users/routes';
import db from '@/db';
import { noObjectFoundSchema } from '@/lib/constants';
import { ComparePass, CreateToken, HashPass } from '@/middlewares/auth';
import { eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { department, designation, users } from '../schema';

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
  return c.json(inserted, HttpStatusCodes.OK);
};

export const signin: AppRouteHandler<SigninRoute> = async (c: any) => {
  const updates = c.req.valid('json');

  console.warn('updates', updates);

  if (Object.keys(updates).length === 0) {
    return c.json(
      noObjectFoundSchema,
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const { email, pass } = await c.req.json();
  const value = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });

  if (!value) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  if (!value.status) {
    return c.json(
      { message: 'Account is disabled' },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  const match = ComparePass(pass, value.pass);
  if (!match) {
    return c.json({ message: 'Email/Password does not match' }, HttpStatusCodes.UNAUTHORIZED);
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    uuid: value.uuid,
    username: value.name,
    email: value.email,
    can_access: value.can_access,
    exp: now + 60 * 60 * 24,
  };

  const token = await CreateToken(payload);

  return c.json({ payload, token }, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const value = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!value) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(value, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0) {
    return c.json(
      noObjectFoundSchema,
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [task] = await db.update(users)
    .set(updates)
    .where(eq(users.uuid, uuid))
    .returning();

  if (!task) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const result = await db.delete(users)
    .where(eq(users.uuid, uuid));

  if (result.rowCount === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
