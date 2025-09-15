import type { AppRouteHandler } from '@/lib/types';

import { desc, eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { program_semester } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(program_semester).values(value).returning({
    name: program_semester.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(program_semester)
    .set(updates)
    .where(eq(program_semester.uuid, uuid))
    .returning({
      name: program_semester.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(program_semester)
    .where(eq(program_semester.uuid, uuid))
    .returning({
      name: program_semester.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.semester.findMany();
  const resultPromise = db.select({
    uuid: program_semester.uuid,
    semester_no: program_semester.semester_no,
    financial_info_uuid: program_semester.financial_info_uuid,
    created_by: program_semester.created_by,
    created_by_name: users.name,
    created_at: program_semester.created_at,
    updated_at: program_semester.updated_at,
    remarks: program_semester.remarks,
  })
    .from(program_semester)
    .leftJoin(users, eq(users.uuid, program_semester.created_by))
    .orderBy(desc(program_semester.created_at));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.select({
    uuid: program_semester.uuid,
    semester_no: program_semester.semester_no,
    financial_info_uuid: program_semester.financial_info_uuid,
    created_by: program_semester.created_by,
    created_by_name: users.name,
    created_at: program_semester.created_at,
    updated_at: program_semester.updated_at,
    remarks: program_semester.remarks,
  })
    .from(program_semester)
    .leftJoin(users, eq(users.uuid, program_semester.created_by))
    .where(eq(program_semester.uuid, uuid));

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
