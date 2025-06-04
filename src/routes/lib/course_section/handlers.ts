import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { course, course_section } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(course_section).values(value).returning({
    name: course_section.name,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(course_section)
    .set(updates)
    .where(eq(course_section.uuid, uuid))
    .returning({
      name: course_section.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(course_section)
    .where(eq(course_section.uuid, uuid))
    .returning({
      name: course_section.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.course_section.findMany();
  const resultPromise = db.select({
    uuid: course_section.uuid,
    name: course_section.name,
    course_uuid: course_section.course_uuid,
    course_name: course.name,
    course_code: course.code,
    created_by: course_section.created_by,
    created_by_name: users.name,
    created_at: course_section.created_at,
    updated_at: course_section.updated_at,
    remarks: course_section.remarks,
  })
    .from(course_section)
    .leftJoin(course, eq(course.uuid, course_section.course_uuid))
    .leftJoin(users, eq(users.uuid, course_section.created_by));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.course_section.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
