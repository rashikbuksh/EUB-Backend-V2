import type { AppRouteHandler } from '@/lib/types';

import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, GetTeacherDetailsRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department, department_teachers, teachers } from '../schema';

const createdByUser = alias(hrSchema.users, 'createdByUser');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(teachers).values(value).returning({
    name: teachers.id,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(teachers)
    .set(updates)
    .where(eq(teachers.uuid, uuid))
    .returning({
      name: teachers.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(teachers)
    .where(eq(teachers.uuid, uuid))
    .returning({
      name: teachers.id,
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
    id: teachers.id,
    uuid: teachers.uuid,
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
    created_at: teachers.created_at,
    updated_at: teachers.updated_at,
    created_by: teachers.created_by,
    created_by_name: createdByUser.name,
    remarks: teachers.remarks,
    teacher_initial: teachers.teacher_initial,
    status: teachers.status,
    interests: teachers.interests,
    awards: teachers.awards,
    experience: teachers.experience,
    courses: teachers.courses,
    corporate: teachers.corporate,

  })
    .from(teachers)
    .leftJoin(hrSchema.users, eq(teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(createdByUser, eq(teachers.created_by, createdByUser.uuid));

  // Build conditions
  const conditions = [];
  if (portfolio_department) {
    conditions.push(eq(department.name, portfolio_department));
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
  // Apply ordering
  resultPromise.orderBy(asc(hrSchema.users.name));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: teachers.id,
    uuid: teachers.uuid,
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
    created_at: teachers.created_at,
    updated_at: teachers.updated_at,
    created_by: teachers.created_by,
    created_by_name: createdByUser.name,
    remarks: teachers.remarks,
    teacher_initial: teachers.teacher_initial,
    status: teachers.status,
    interests: teachers.interests,
    awards: teachers.awards,
    experience: teachers.experience,
    courses: teachers.courses,
    corporate: teachers.corporate,
  })
    .from(teachers)
    .leftJoin(hrSchema.users, eq(teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(createdByUser, eq(teachers.created_by, createdByUser.uuid))
    .where(eq(teachers.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};

export const getTeacherDetails: AppRouteHandler<GetTeacherDetailsRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: teachers.id,
    uuid: teachers.uuid,
    teacher_uuid: teachers.teacher_uuid,
    teacher_name: hrSchema.users.name,
    teacher_email: teachers.teacher_email,
    teacher_phone: teachers.teacher_phone,
    teacher_designation: hrSchema.designation.name,
    department_name: department.name,
    office: hrSchema.users.office,
    teacher_image: hrSchema.users.image,
    education: teachers.education,
    publication: teachers.publication,
    journal: teachers.journal,
    appointment_date: teachers.appointment_date,
    resign_date: teachers.resign_date,
    about: teachers.about,
    created_at: teachers.created_at,
    updated_at: teachers.updated_at,
    created_by: teachers.created_by,
    created_by_name: createdByUser.name,
    remarks: teachers.remarks,
    teacher_initial: teachers.teacher_initial,
    status: teachers.status,
    interests: teachers.interests,
    awards: teachers.awards,
    experience: teachers.experience,
    courses: teachers.courses,
    corporate: teachers.corporate,
  })
    .from(teachers)
    .leftJoin(hrSchema.users, eq(teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(department_teachers, eq(teachers.uuid, department_teachers.teachers_uuid))
    .leftJoin(department, eq(department_teachers.department_uuid, department.uuid))
    .leftJoin(createdByUser, eq(teachers.created_by, createdByUser.uuid))
    .where(eq(teachers.uuid, uuid));

  const data = await resultPromise;

  return c.json(data[0] || {}, HSCode.OK);
};
