import type { AppRouteHandler } from '@/lib/types';

import { asc, eq, sql } from 'drizzle-orm';
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
    index: course_section.index,
    type: course_section.type,
  })
    .from(course_section)
    .leftJoin(course, eq(course.uuid, course_section.course_uuid))
    .leftJoin(users, eq(users.uuid, course_section.created_by))
    .orderBy(asc(course_section.index));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.course_section.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  // });
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
    index: course_section.index,
    type: course_section.type,
    sem_crs_thr_entry: sql`COALESCE(ARRAY(
          SELECT jsonb_build_object(
            'uuid', sem_crs_thr_entry.uuid,
            'semester_uuid', sem_crs_thr_entry.semester_uuid,
            'course_section_uuid', sem_crs_thr_entry.course_section_uuid,
            'teachers_uuid', sem_crs_thr_entry.teachers_uuid,
            'teacher_uuid', teachers.teacher_uuid,
            'teachers_name', teacherUser.name,
            'class_size', sem_crs_thr_entry.class_size,
            'is_mid_evaluation_complete', sem_crs_thr_entry.is_mid_evaluation_complete,
            'is_final_evaluation_complete', sem_crs_thr_entry.is_final_evaluation_complete,
            'created_by', sem_crs_thr_entry.created_by,
            'created_by_name', users.name,
            'created_at', sem_crs_thr_entry.created_at,
            'updated_at', sem_crs_thr_entry.updated_at
          )
          FROM lib.sem_crs_thr_entry
          LEFT JOIN portfolio.teachers ON teachers.uuid = sem_crs_thr_entry.teachers_uuid
          LEFT JOIN hr.users teacherUser ON teacherUser.uuid = teachers.teacher_uuid
          LEFT JOIN hr.users ON users.uuid = sem_crs_thr_entry.created_by
          WHERE sem_crs_thr_entry.course_section_uuid = ${course_section.uuid}
          ORDER BY sem_crs_thr_entry.created_at DESC
        ), ARRAY[]::jsonb[])`.as('sem_crs_thr_entry'),
  })
    .from(course_section)
    .leftJoin(course, eq(course.uuid, course_section.course_uuid))
    .leftJoin(users, eq(users.uuid, course_section.created_by))
    .where(eq(course_section.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
