import type { AppRouteHandler } from '@/lib/types';

import { and, eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetDepartmentTeacherDetailsRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department, department_teachers, teachers } from '../schema';

const createdByUser = alias(hrSchema.users, 'createdByUser');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(department_teachers).values(value).returning({
    name: department_teachers.id,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(department_teachers)
    .set(updates)
    .where(eq(department_teachers.uuid, uuid))
    .returning({
      name: department_teachers.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(department_teachers)
    .where(eq(department_teachers.uuid, uuid))
    .returning({
      name: department_teachers.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { portfolio_department, access, is_resign } = c.req.valid('query');

  let accessArray = [];
  if (access) {
    accessArray = access.split(',');
  }

  const resultPromise = db.select({
    id: department_teachers.id,
    uuid: department_teachers.uuid,
    teacher_uuid: teachers.teacher_uuid,
    teacher_name: hrSchema.users.name,
    teacher_email: teachers.teacher_email,
    teacher_phone: teachers.teacher_phone,
    teacher_image: hrSchema.users.image,
    education: teachers.education,
    publication: teachers.publication,
    journal: teachers.journal,
    appointment_date: teachers.appointment_date,
    resign_date: teachers.resign_date,
    about: teachers.about,
    teacher_initial: teachers.teacher_initial,
    teachers_status: teachers.status,
    department_uuid: department_teachers.department_uuid,
    department_name: department.name,
    department_head: department_teachers.department_head,
    department_head_message: department_teachers.department_head_message,
    teacher_designation: department_teachers.teacher_designation,
    status: department_teachers.status,
    created_at: department_teachers.created_at,
    updated_at: department_teachers.updated_at,
    created_by: department_teachers.created_by,
    created_by_name: createdByUser.name,
    remarks: department_teachers.remarks,
    teachers_uuid: teachers.uuid,
  })
    .from(department_teachers)
    .leftJoin(teachers, eq(department_teachers.teachers_uuid, teachers.uuid))
    .leftJoin(department, eq(department_teachers.department_uuid, department.uuid))
    .leftJoin(hrSchema.users, eq(teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(createdByUser, eq(department_teachers.created_by, createdByUser.uuid));

  // Build conditions
  const conditions = [];
  if (portfolio_department) {
    conditions.push(eq(department.name, sql`lower(portfolio_department)`));
  }

  if (is_resign === 'true') {
    conditions.push(sql`teachers.resign_date IS NULL`);
  }
  else if (is_resign === 'false') {
    conditions.push(sql`teachers.resign_date IS NOT NULL`);
  }

  if (accessArray.length > 0) {
    conditions.push(inArray(department.short_name, accessArray));
  }

  // Apply conditions to the query
  if (conditions.length > 0) {
    resultPromise.where(and(...conditions));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: department_teachers.id,
    uuid: department_teachers.uuid,
    teacher_uuid: teachers.teacher_uuid,
    teacher_name: hrSchema.users.name,
    teacher_email: teachers.teacher_email,
    teacher_phone: teachers.teacher_phone,
    teacher_image: hrSchema.users.image,
    education: teachers.education,
    publication: teachers.publication,
    journal: teachers.journal,
    appointment_date: teachers.appointment_date,
    resign_date: teachers.resign_date,
    about: teachers.about,
    teacher_initial: teachers.teacher_initial,
    teachers_status: teachers.status,
    department_uuid: department_teachers.department_uuid,
    department_name: department.name,
    department_head: department_teachers.department_head,
    department_head_message: department_teachers.department_head_message,
    teacher_designation: department_teachers.teacher_designation,
    status: department_teachers.status,
    created_at: department_teachers.created_at,
    updated_at: department_teachers.updated_at,
    created_by: department_teachers.created_by,
    created_by_name: createdByUser.name,
    remarks: department_teachers.remarks,
    teachers_uuid: teachers.uuid,
  })
    .from(department_teachers)
    .leftJoin(teachers, eq(department_teachers.teachers_uuid, teachers.uuid))
    .leftJoin(hrSchema.users, eq(teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(department, eq(department_teachers.department_uuid, department.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(createdByUser, eq(department_teachers.created_by, createdByUser.uuid))
    .where(eq(department_teachers.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};

export const getDepartmentTeacherDetails: AppRouteHandler<GetDepartmentTeacherDetailsRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: department_teachers.id,
    uuid: department_teachers.uuid,
    teacher_uuid: teachers.teacher_uuid,
    teacher_name: hrSchema.users.name,
    teacher_email: teachers.teacher_email,
    teacher_phone: teachers.teacher_phone,
    teacher_image: hrSchema.users.image,
    education: teachers.education,
    publication: teachers.publication,
    journal: teachers.journal,
    appointment_date: teachers.appointment_date,
    resign_date: teachers.resign_date,
    about: teachers.about,
    teacher_initial: teachers.teacher_initial,
    teachers_status: teachers.status,
    department_uuid: department_teachers.department_uuid,
    department_name: department.name,
    department_head: department_teachers.department_head,
    department_head_message: department_teachers.department_head_message,
    teacher_designation: department_teachers.teacher_designation,
    status: department_teachers.status,
    created_at: department_teachers.created_at,
    updated_at: department_teachers.updated_at,
    created_by: department_teachers.created_by,
    created_by_name: createdByUser.name,
    remarks: department_teachers.remarks,
    teachers_uuid: teachers.uuid,
  })
    .from(department_teachers)
    .leftJoin(teachers, eq(department_teachers.teachers_uuid, teachers.uuid))
    .leftJoin(hrSchema.users, eq(teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(department, eq(department_teachers.department_uuid, department.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(createdByUser, eq(department_teachers.created_by, createdByUser.uuid))
    .where(eq(department_teachers.uuid, uuid));

  const data = await resultPromise;

  return c.json(data[0] || {}, HSCode.OK);
};
