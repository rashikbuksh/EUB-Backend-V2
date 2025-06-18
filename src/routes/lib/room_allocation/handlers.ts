import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { room, room_allocation } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(room_allocation).values(value).returning({
    name: room_allocation.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(room_allocation)
    .set(updates)
    .where(eq(room_allocation.uuid, uuid))
    .returning({
      name: room_allocation.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(room_allocation)
    .where(eq(room_allocation.uuid, uuid))
    .returning({
      name: room_allocation.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.room_allocation.findMany();
  const resultPromise = db.select({
    uuid: room_allocation.uuid,
    room_uuid: room_allocation.room_uuid,
    room_name: room.name,
    sem_crs_thr_entry_uuid: room_allocation.sem_crs_thr_entry_uuid,
    day: room_allocation.day,
    from: room_allocation.from,
    to: room_allocation.to,
    created_by: room_allocation.created_by,
    created_by_name: users.name,
    created_at: room_allocation.created_at,
    updated_at: room_allocation.updated_at,
    remarks: room_allocation.remarks,
  })
    .from(room_allocation)
    .leftJoin(room, eq(room.uuid, room_allocation.room_uuid))
    .leftJoin(users, eq(users.uuid, room_allocation.created_by));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.room_allocation.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  // });
  const resultPromise = db.select({
    uuid: room_allocation.uuid,
    room_uuid: room_allocation.room_uuid,
    room_name: room.name,
    sem_crs_thr_entry_uuid: room_allocation.sem_crs_thr_entry_uuid,
    day: room_allocation.day,
    from: room_allocation.from,
    to: room_allocation.to,
    created_by: room_allocation.created_by,
    created_by_name: users.name,
    created_at: room_allocation.created_at,
    updated_at: room_allocation.updated_at,
    remarks: room_allocation.remarks,
  })
    .from(room_allocation)
    .leftJoin(room, eq(room.uuid, room_allocation.room_uuid))
    .leftJoin(users, eq(users.uuid, room_allocation.created_by))
    .where(eq(room_allocation.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
