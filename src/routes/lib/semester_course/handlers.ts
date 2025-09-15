import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { semester_course } from '../schema';

// const teacherUser = alias(hrSchema.users, 'teacherUser');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(semester_course).values(value).returning({
    name: semester_course.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(semester_course)
    .set(updates)
    .where(eq(semester_course.uuid, uuid))
    .returning({
      name: semester_course.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(semester_course)
    .where(eq(semester_course.uuid, uuid))
    .returning({
      name: semester_course.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.course.findMany();
  const resultPromise = db.select({
    uuid: semester_course.uuid,
    program_semester_uuid: semester_course.program_semester_uuid,
    course_uuid: semester_course.course_uuid,
    created_by: semester_course.created_by,
    created_by_name: users.name,
    created_at: semester_course.created_at,
    updated_at: semester_course.updated_at,
    remarks: semester_course.remarks,
  })
    .from(semester_course)
    .leftJoin(users, eq(users.uuid, semester_course.created_by));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: semester_course.uuid,
    program_semester_uuid: semester_course.program_semester_uuid,
    course_uuid: semester_course.course_uuid,
    created_by: semester_course.created_by,
    created_by_name: users.name,
    created_at: semester_course.created_at,
    updated_at: semester_course.updated_at,
    remarks: semester_course.remarks,
  })
    .from(semester_course)
    .leftJoin(users, eq(users.uuid, semester_course.created_by))
    .where(eq(semester_course.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
