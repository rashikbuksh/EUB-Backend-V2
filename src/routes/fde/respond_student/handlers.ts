import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { course, course_section, sem_crs_thr_entry, semester } from '@/routes/lib/schema';
import { teachers } from '@/routes/portfolio/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, GetRespondStudentDetailsWithEvaluationRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { respond_student } from './../schema';

const teacherUser = alias(users, 'teacherUser');

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
    semester_uuid: sem_crs_thr_entry.semester_uuid,
    semester_name: semester.name,
    course_section_uuid: sem_crs_thr_entry.course_section_uuid,
    course_section_name: course_section.name,
    course_uuid: course.uuid,
    course_name: course.name,
    teacher_uuid: teacherUser.uuid,
    teacher_name: teacherUser.name,

  })
    .from(respond_student)
    .leftJoin(sem_crs_thr_entry, eq(sem_crs_thr_entry.uuid, respond_student.sem_crs_thr_entry_uuid))
    .leftJoin(semester, eq(semester.uuid, sem_crs_thr_entry.semester_uuid))
    .leftJoin(course_section, eq(course_section.uuid, sem_crs_thr_entry.course_section_uuid))
    .leftJoin(course, eq(course.uuid, course_section.course_uuid))
    .leftJoin(teachers, eq(teachers.uuid, sem_crs_thr_entry.teachers_uuid))
    .leftJoin(teacherUser, eq(teacherUser.uuid, teachers.teacher_uuid))
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

export const getRespondStudentDetailsWithEvaluation: AppRouteHandler<GetRespondStudentDetailsWithEvaluationRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = await db.select({
    uuid: respond_student.uuid,
    sem_crs_thr_entry_uuid: respond_student.sem_crs_thr_entry_uuid,
    id: respond_student.id,
    evaluation_time: respond_student.evaluation_time,
    created_by: respond_student.created_by,
    created_by_name: users.name,
    created_at: respond_student.created_at,
    updated_at: respond_student.updated_at,
    remarks: respond_student.remarks,
    evaluation: sql`COALESCE(ARRAY(
          SELECT jsonb_build_object(
            'uuid', evaluation.uuid,
            'respond_student_uuid', evaluation.respond_student_uuid,
            'qns_uuid', evaluation.qns_uuid,
            'qns_name', qns.name,
            'qns_category_uuid', qns.qns_category_uuid,
            'qns_category_name', qns_category.name,
            'rating', evaluation.rating,
            'created_by', evaluation.created_by,
            'created_by_name', users.name,
            'created_at', evaluation.created_at,
            'updated_at', evaluation.updated_at
          )
          FROM fde.evaluation
          LEFT JOIN fde.qns ON evaluation.qns_uuid = qns.uuid
          LEFT JOIN fde.qns_category ON qns.qns_category_uuid = qns_category.uuid
          LEFT JOIN hr.users ON users.uuid = evaluation.created_by
          WHERE evaluation.respond_student_uuid = ${respond_student.uuid}
        ), ARRAY[]::jsonb[])`.as('evaluation'),

  })
    .from(respond_student)
    .leftJoin(sem_crs_thr_entry, eq(sem_crs_thr_entry.uuid, respond_student.sem_crs_thr_entry_uuid))
    .leftJoin(users, eq(users.uuid, respond_student.created_by))
    .where(eq(respond_student.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
