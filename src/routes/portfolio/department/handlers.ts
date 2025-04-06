import type { AppRouteHandler } from '@/lib/types';

import { asc, eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetDepartmentAndDepartmentTeachersDetailsByDepartmentUuidRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department, faculty } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(department).values(value).returning({
    name: department.id,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(department)
    .set(updates)
    .where(eq(department.uuid, uuid))
    .returning({
      name: department.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(department)
    .where(eq(department.uuid, uuid))
    .returning({
      name: department.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select(
    {
      uuid: department.uuid,
      name: department.name,
      short_name: department.short_name,
      faculty_uuid: department.faculty_uuid,
      faculty_name: faculty.name,
      category: department.category,
      created_at: department.created_at,
      updated_at: department.updated_at,
      created_by: department.created_by,
      created_by_name: hrSchema.users.name,
      page_link: department.page_link,
      index: department.index,
    },
  )
    .from(department)
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid))
    .leftJoin(hrSchema.users, eq(department.created_by, hrSchema.users.uuid));

  resultPromise.orderBy(asc(department.index));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select(
    {
      uuid: department.uuid,
      name: department.name,
      short_name: department.short_name,
      faculty_uuid: department.faculty_uuid,
      faculty_name: faculty.name,
      category: department.category,
      created_at: department.created_at,
      updated_at: department.updated_at,
      created_by: department.created_by,
      created_by_name: hrSchema.users.name,
      page_link: department.page_link,
      index: department.index,
    },
  )
    .from(department)
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid))
    .leftJoin(hrSchema.users, eq(department.created_by, hrSchema.users.uuid))
    .where(eq(department.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};

export const getDepartmentAndDepartmentTeachersDetailsByDepartmentUuid: AppRouteHandler<GetDepartmentAndDepartmentTeachersDetailsByDepartmentUuidRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.department.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  //   with: {
  //     department_teachers: true,
  //   },
  // });

  const resultPromise = db.select(
    {
      uuid: department.uuid,
      name: department.name,
      short_name: department.short_name,
      faculty_uuid: department.faculty_uuid,
      faculty_name: faculty.name,
      category: department.category,
      created_at: department.created_at,
      updated_at: department.updated_at,
      created_by: department.created_by,
      created_by_name: hrSchema.users.name,
      page_link: department.page_link,
      index: department.index,
      department_teaches: sql`COALESCE(ARRAY(SELECT json_build_object(
        'id', department_teachers.id,
        'uuid', department_teachers.uuid,
        'department_uuid', department_teachers.department_uuid,
        'department_name', department.name,
        'teacher_uuid', department_teachers.teacher_uuid,
        'teacher_name', teachers.name,
        'teacher_designation', department_teachers.teacher_designation,
        'teacher_email', department_teachers.teacher_email,
        'teacher_phone', department_teachers.teacher_phone,
        'department_head', department_teachers.department_head,
        'education', department_teachers.education,
        'publication', department_teachers.publication,
        'journal', department_teachers.journal,
        'appointment_date', department_teachers.appointment_date,
        'resign_date', department_teachers.resign_date,
        'about', department_teachers.about,
        'created_at', department_teachers.created_at,
        'updated_at', department_teachers.updated_at,
        'created_by', department_teachers.created_by,
        'created_by_name', createdByUser.name,
        'remarks', department_teachers.remarks,
        'department_head_message', department_teachers.department_head_message,
        'teacher_initial', department_teachers.teacher_initial,
        'index', department_teachers.index
      ) 
      FROM portfolio.department_teachers
      LEFT JOIN hr.users createdByUser ON department_teachers.created_by = createdByUser.uuid
      LEFT JOIN hr.users teachers ON department_teachers.teacher_uuid = teachers.uuid
      WHERE department_teachers.department_uuid = ${department.uuid}), '{}')`,
    },
  )
    .from(department)
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid))
    .leftJoin(hrSchema.users, eq(department.created_by, hrSchema.users.uuid))
    .where(eq(department.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
