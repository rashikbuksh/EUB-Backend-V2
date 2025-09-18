import type { AppRouteHandler } from '@/lib/types';

import { and, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { designation, users } from '@/routes/hr/schema';
import { department, department_teachers, teachers } from '@/routes/portfolio/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { course, course_section, room, room_allocation, sem_crs_thr_entry, semester } from '../schema';

const teacherUser = alias(users, 'teacherUser');

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

  const { room_uuid, semester_uuid, teachers_uuid } = c.req.valid('query');

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
    teacher_name: teacherUser.name,
    teacher_phone: teachers.teacher_phone,
    teacher_email: teachers.teacher_email,
    teacher_initial: teachers.teacher_initial,
    teacher_department: department.name,
    teacher_designation: designation.name,
    class_size: sem_crs_thr_entry.class_size,
    course_uuid: course_section.course_uuid,
    course_name: course.name,
    course_code: course.code,
    course_section_uuid: sem_crs_thr_entry.course_section_uuid,
    course_section: course_section.name,
    semester_uuid: sem_crs_thr_entry.semester_uuid,
    semester_name: semester.name,

  })
    .from(room_allocation)
    .leftJoin(room, eq(room.uuid, room_allocation.room_uuid))
    .leftJoin(sem_crs_thr_entry, eq(sem_crs_thr_entry.uuid, room_allocation.sem_crs_thr_entry_uuid))
    .leftJoin(teachers, eq(teachers.uuid, sem_crs_thr_entry.teachers_uuid))
    .leftJoin(teacherUser, eq(teacherUser.uuid, teachers.teacher_uuid))
    .leftJoin(designation, eq(teacherUser.designation_uuid, designation.uuid))
    .leftJoin(department_teachers, eq(teachers.uuid, department_teachers.teachers_uuid))
    .leftJoin(department, eq(department_teachers.department_uuid, department.uuid))
    .leftJoin(users, eq(users.uuid, room_allocation.created_by))
    .leftJoin(course_section, eq(course_section.uuid, sem_crs_thr_entry.course_section_uuid))
    .leftJoin(course, eq(course.uuid, course_section.course_uuid))
    .leftJoin(semester, eq(semester.uuid, sem_crs_thr_entry.semester_uuid));

  const filters = [];

  if (room_uuid)
    filters.push(eq(room_allocation.room_uuid, room_uuid));
  if (semester_uuid)
    filters.push(eq(sem_crs_thr_entry.semester_uuid, semester_uuid));
  if (teachers_uuid)
    filters.push(eq(sem_crs_thr_entry.teachers_uuid, teachers_uuid));

  if (filters.length > 0) {
    resultPromise.where(and(...filters));
  }

  const data = await resultPromise;

  // Deduplicate by uuid
  const uniqueData = Object.values(
    (data || []).reduce((acc: any, item: any) => {
      acc[item.uuid] = item;
      return acc;
    }, {}),
  );

  // if (!uniqueData || uniqueData.length === 0)
  //   return DataNotFound(c);

  return c.json(uniqueData, HSCode.OK);
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
    teacher_name: teacherUser.name,
    class_size: sem_crs_thr_entry.class_size,
    course_uuid: course_section.course_uuid,
    course_name: course.name,
    course_code: course.code,
    course_section_uuid: sem_crs_thr_entry.course_section_uuid,
    course_section: course_section.name,
    semester_uuid: sem_crs_thr_entry.semester_uuid,
    semester_name: semester.name,
  })
    .from(room_allocation)
    .leftJoin(room, eq(room.uuid, room_allocation.room_uuid))
    .leftJoin(sem_crs_thr_entry, eq(sem_crs_thr_entry.uuid, room_allocation.sem_crs_thr_entry_uuid))
    .leftJoin(teachers, eq(teachers.uuid, sem_crs_thr_entry.teachers_uuid))
    .leftJoin(teacherUser, eq(teacherUser.uuid, teachers.teacher_uuid))
    .leftJoin(course_section, eq(course_section.uuid, sem_crs_thr_entry.course_section_uuid))
    .leftJoin(course, eq(course.uuid, course_section.course_uuid))
    .leftJoin(users, eq(users.uuid, room_allocation.created_by))
    .leftJoin(semester, eq(semester.uuid, sem_crs_thr_entry.semester_uuid))
    .where(eq(room_allocation.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
