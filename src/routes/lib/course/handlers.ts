import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetCourseAndSectionDetailsRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { course, course_section } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(course).values(value).returning({
    name: course.name,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(course)
    .set(updates)
    .where(eq(course.uuid, uuid))
    .returning({
      name: course.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(course)
    .where(eq(course.uuid, uuid))
    .returning({
      name: course.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.course.findMany();
  const resultPromise = db.select({
    uuid: course.uuid,
    name: course.name,
    code: course.code,
    created_by: course.created_by,
    created_by_name: users.name,
    created_at: course.created_at,
    updated_at: course.updated_at,
    remarks: course.remarks,
  })
    .from(course)
    .leftJoin(users, eq(users.uuid, course.created_by));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.course.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  // });

  const resultPromise = db.select({
    uuid: course.uuid,
    name: course.name,
    code: course.code,
    created_by: course.created_by,
    created_by_name: users.name,
    created_at: course.created_at,
    updated_at: course.updated_at,
    remarks: course.remarks,
    course_section: sql`COALESCE(ARRAY(
          SELECT jsonb_build_object(
            'uuid', course_section.uuid,
            'name', course_section.name,
            'course_uuid', course_section.course_uuid,
            'created_by', course_section.created_by,
            'created_by_name', users.name,
            'created_at', course_section.created_at,
            'updated_at', course_section.updated_at,
            'remarks', course_section.remarks
          )
          FROM lib.course_section
          LEFT JOIN hr.users ON users.uuid = course_section.created_by
          WHERE course_section.course_uuid = ${course.uuid}
  ), ARRAY[]::jsonb[])`.as('course_section'),
  })
    .from(course)
    .leftJoin(users, eq(users.uuid, course.created_by))
    .where(eq(course.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};

export const getCourseAndSectionDetails: AppRouteHandler<GetCourseAndSectionDetailsRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: course.uuid,
    name: course.name,
    code: course.code,
    course_section_uuid: course_section.uuid,
    course_section_name: course_section.name,
    class_size: sql`0`,
    teacher_uuid: sql`NULL`,
    created_by: course.created_by,
    created_by_name: users.name,
    created_at: course.created_at,
    updated_at: course.updated_at,
    remarks: course.remarks,
  })
    .from(course)
    .leftJoin(
      course_section,
      eq(course_section.course_uuid, course.uuid),
    )
    .leftJoin(users, eq(users.uuid, course.created_by))
    .where(eq(course.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
