import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { calender, room } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(calender).values(value).returning({
    name: calender.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(calender)
    .set(updates)
    .where(eq(calender.uuid, uuid))
    .returning({
      name: calender.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(calender)
    .where(eq(calender.uuid, uuid))
    .returning({
      name: calender.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.calender.findMany();

  const resultPromise = db.select({
    uuid: calender.uuid,
    room_uuid: calender.room_uuid,
    date: calender.date,
    from: calender.from,
    to: calender.to,
    arrange_by: calender.arrange_by,
    purpose: calender.purpose,
    created_by: calender.created_by,
    created_by_name: users.name,
    created_at: calender.created_at,
    updated_by: calender.updated_by,
    updated_at: calender.updated_at,
    remarks: calender.remarks,
  })
    .from(calender)
    .leftJoin(users, eq(users.uuid, calender.created_by))
    .leftJoin(room, eq(room.uuid, calender.room_uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: calender.uuid,
    room_uuid: calender.room_uuid,
    date: calender.date,
    from: calender.from,
    to: calender.to,
    arrange_by: calender.arrange_by,
    purpose: calender.purpose,
    created_by: calender.created_by,
    created_by_name: users.name,
    created_at: calender.created_at,
    updated_by: calender.updated_by,
    updated_at: calender.updated_at,
    remarks: calender.remarks,
  })
    .from(calender)
    .leftJoin(users, eq(users.uuid, calender.created_by))
    .leftJoin(room, eq(room.uuid, calender.room_uuid))
    .where(eq(calender.uuid, uuid));

  const data = await resultPromise;

  // if (!data)
  //   return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
