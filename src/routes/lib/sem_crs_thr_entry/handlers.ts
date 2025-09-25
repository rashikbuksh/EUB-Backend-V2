import type { AppRouteHandler } from '@/lib/types';

import { and, eq, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { hasValue } from '@/lib/variables';
import { users } from '@/routes/hr/schema';
import * as hrSchema from '@/routes/hr/schema';
import { department, financial_info, teachers } from '@/routes/portfolio/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { course, course_section, sem_crs_thr_entry, semester } from '../schema';

const teacherUser = alias(hrSchema.users, 'teacherUser');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(sem_crs_thr_entry).values(value).returning({
    name: sem_crs_thr_entry.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(sem_crs_thr_entry)
    .set(updates)
    .where(eq(sem_crs_thr_entry.uuid, uuid))
    .returning({
      name: sem_crs_thr_entry.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(sem_crs_thr_entry)
    .where(eq(sem_crs_thr_entry.uuid, uuid))
    .returning({
      name: sem_crs_thr_entry.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.sem_crs_thr_entry.findMany();
  const { user_uuid, status, semester_uuid, department_uuid } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: sem_crs_thr_entry.uuid,
    semester_uuid: sem_crs_thr_entry.semester_uuid,
    semester_name: semester.name,
    course_section_uuid: sem_crs_thr_entry.course_section_uuid,
    course_section_name: course_section.name,
    course_uuid: course_section.course_uuid,
    course_name: course.name,
    course_code: course.code,
    teachers_uuid: sem_crs_thr_entry.teachers_uuid,
    teacher_uuid: teachers.teacher_uuid,
    teacher_name: teacherUser.name,
    teacher_email: teachers.teacher_email,
    teacher_phone: teachers.teacher_phone,
    teacher_initials: teachers.teacher_initial,
    class_size: sem_crs_thr_entry.class_size,
    is_mid_evaluation_complete: sem_crs_thr_entry.is_mid_evaluation_complete,
    is_final_evaluation_complete: sem_crs_thr_entry.is_final_evaluation_complete,
    created_by: sem_crs_thr_entry.created_by,
    created_by_name: users.name,
    created_at: sem_crs_thr_entry.created_at,
    updated_at: sem_crs_thr_entry.updated_at,
    remarks: sem_crs_thr_entry.remarks,
    mid_evaluation_response: sql`(
      SELECT COUNT(*)::float8 
      FROM fde.respond_student 
      WHERE respond_student.sem_crs_thr_entry_uuid = ${sem_crs_thr_entry.uuid} 
        AND respond_student.evaluation_time = 'mid'
    )`,
    final_evaluation_response: sql`(
      SELECT COUNT(*) ::float8
      FROM fde.respond_student 
      WHERE respond_student.sem_crs_thr_entry_uuid = ${sem_crs_thr_entry.uuid} 
        AND respond_student.evaluation_time = 'final'
    )`,
    financial_info_uuid: course.financial_info_uuid,
    department_uuid: financial_info.department_uuid,
    department_name: department.name,
  })
    .from(sem_crs_thr_entry)
    .leftJoin(semester, eq(semester.uuid, sem_crs_thr_entry.semester_uuid))
    .leftJoin(course_section, eq(course_section.uuid, sem_crs_thr_entry.course_section_uuid))
    .leftJoin(course, eq(course.uuid, course_section.course_uuid))
    .leftJoin(teachers, eq(teachers.uuid, sem_crs_thr_entry.teachers_uuid))
    .leftJoin(teacherUser, eq(teacherUser.uuid, teachers.teacher_uuid))
    .leftJoin(users, eq(users.uuid, sem_crs_thr_entry.created_by))
    .leftJoin(financial_info, eq(financial_info.uuid, course.financial_info_uuid))
    .leftJoin(department, eq(department.uuid, financial_info.department_uuid));

  const filters = [];

  if (hasValue(user_uuid)) {
    filters.push(eq(teachers.teacher_uuid, user_uuid));
  }

  if (hasValue(semester_uuid)) {
    filters.push(eq(sem_crs_thr_entry.semester_uuid, semester_uuid));
  }

  if (hasValue(department_uuid)) {
    filters.push(eq(department.uuid, department_uuid));
  }

  if (status === 'complete') {
    filters.push(
      and(
        eq(sem_crs_thr_entry.is_mid_evaluation_complete, true),
        eq(sem_crs_thr_entry.is_final_evaluation_complete, true),
      ),
    );
  }
  else if (status === 'pending') {
    filters.push(
      or(
        eq(sem_crs_thr_entry.is_mid_evaluation_complete, false),
        eq(sem_crs_thr_entry.is_final_evaluation_complete, false),
      ),
    );
  }

  if (filters.length > 0) {
    resultPromise.where(and(...filters));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: sem_crs_thr_entry.uuid,
    semester_uuid: sem_crs_thr_entry.semester_uuid,
    semester_name: semester.name,
    course_section_uuid: sem_crs_thr_entry.course_section_uuid,
    course_section_name: course_section.name,
    course_uuid: course_section.course_uuid,
    course_name: course.name,
    course_code: course.code,
    teachers_uuid: sem_crs_thr_entry.teachers_uuid,
    teacher_uuid: teachers.teacher_uuid,
    teacher_name: teacherUser.name,
    teacher_email: teachers.teacher_email,
    teacher_phone: teachers.teacher_phone,
    teacher_initials: teachers.teacher_initial,
    class_size: sem_crs_thr_entry.class_size,
    is_mid_evaluation_complete: sem_crs_thr_entry.is_mid_evaluation_complete,
    is_final_evaluation_complete: sem_crs_thr_entry.is_final_evaluation_complete,
    created_by: sem_crs_thr_entry.created_by,
    created_by_name: users.name,
    created_at: sem_crs_thr_entry.created_at,
    updated_at: sem_crs_thr_entry.updated_at,
    remarks: sem_crs_thr_entry.remarks,
    financial_info_uuid: course.financial_info_uuid,
    department_uuid: financial_info.department_uuid,
    department_name: department.name,
  })
    .from(sem_crs_thr_entry)
    .leftJoin(semester, eq(semester.uuid, sem_crs_thr_entry.semester_uuid))
    .leftJoin(course_section, eq(course_section.uuid, sem_crs_thr_entry.course_section_uuid))
    .leftJoin(course, eq(course.uuid, course_section.course_uuid))
    .leftJoin(teachers, eq(teachers.uuid, sem_crs_thr_entry.teachers_uuid))
    .leftJoin(teacherUser, eq(teacherUser.uuid, teachers.teacher_uuid))
    .leftJoin(users, eq(users.uuid, sem_crs_thr_entry.created_by))
    .leftJoin(financial_info, eq(financial_info.uuid, course.financial_info_uuid))
    .leftJoin(department, eq(department.uuid, financial_info.department_uuid))
    .where(eq(sem_crs_thr_entry.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
