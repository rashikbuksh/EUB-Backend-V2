import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { room, room_allocation, sem_crs_thr_entry } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(room).values(value).returning({
    name: room.name,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(room)
    .set(updates)
    .where(eq(room.uuid, uuid))
    .returning({
      name: room.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(room)
    .where(eq(room.uuid, uuid))
    .returning({
      name: room.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.room.findMany();

  const { semester_uuid } = c.req.valid('query');

  const resultPromise = db.selectDistinct({
    uuid: room.uuid,
    name: room.name,
    type: room.type,
    location: room.location,
    created_by: room.created_by,
    created_by_name: users.name,
    created_at: room.created_at,
    updated_at: room.updated_at,
    remarks: room.remarks,
    capacity: room.capacity,
  })
    .from(room)
    .leftJoin(users, eq(users.uuid, room.created_by))
    .leftJoin(room_allocation, eq(room_allocation.room_uuid, room.uuid))
    .leftJoin(sem_crs_thr_entry, eq(sem_crs_thr_entry.uuid, room_allocation.sem_crs_thr_entry_uuid));

  if (semester_uuid) {
    resultPromise.where(eq(sem_crs_thr_entry.semester_uuid, semester_uuid));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.room.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  // });
  const resultPromise = db.select({
    uuid: room.uuid,
    name: room.name,
    type: room.type,
    location: room.location,
    created_by: room.created_by,
    created_by_name: users.name,
    created_at: room.created_at,
    updated_at: room.updated_at,
    remarks: room.remarks,
    capacity: room.capacity,
  })
    .from(room)
    .leftJoin(users, eq(users.uuid, room.created_by))
    .where(eq(room.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
