import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { sem_crs_thr_entry } from '@/routes/lib/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { respond_student } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(respond_student).values(value).returning({
    name: respond_student.id,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(respond_student)
    .set(updates)
    .where(eq(respond_student.uuid, uuid))
    .returning({
      name: respond_student.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(respond_student)
    .where(eq(respond_student.uuid, uuid))
    .returning({
      name: respond_student.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.respond_student.findMany();
  const resultPromise = db.select({
    uuid: respond_student.uuid,
    sem_crs_thr_entry_uuid: respond_student.sem_crs_thr_entry_uuid,
    id: respond_student.id,
    evaluation_time: respond_student.evaluation_time,
    created_by: respond_student.created_by,
    created_by_name: users.name,
    created_at: respond_student.created_at,
    updated_at: respond_student.updated_at,
    remarks: respond_student.remarks,
  })
    .from(respond_student)
    .leftJoin(sem_crs_thr_entry, eq(sem_crs_thr_entry.uuid, respond_student.sem_crs_thr_entry_uuid))
    .leftJoin(users, eq(users.uuid, respond_student.created_by));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.select({
    uuid: respond_student.uuid,
    sem_crs_thr_entry_uuid: respond_student.sem_crs_thr_entry_uuid,
    id: respond_student.id,
    evaluation_time: respond_student.evaluation_time,
    created_by: respond_student.created_by,
    created_by_name: users.name,
    created_at: respond_student.created_at,
    updated_at: respond_student.updated_at,
    remarks: respond_student.remarks,
  })
    .from(respond_student)
    .leftJoin(sem_crs_thr_entry, eq(sem_crs_thr_entry.uuid, respond_student.sem_crs_thr_entry_uuid))
    .leftJoin(users, eq(users.uuid, respond_student.created_by))
    .where(eq(respond_student.uuid, uuid));

  if (!data)
    return DataNotFound(c);

  return c.json(data, HSCode.OK);
};
