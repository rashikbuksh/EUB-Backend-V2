import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department, department_teachers } from '../schema';

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
  const { portfolio_department } = c.req.valid('query');

  const resultPromise = db.select({
    id: department_teachers.id,
    uuid: department_teachers.uuid,
    department_uuid: department_teachers.department_uuid,
    department_name: department.name,
    teacher_uuid: department_teachers.teacher_uuid,
    teacher_name: hrSchema.users.name,
    teacher_designation: hrSchema.designation.name,
    teacher_email: hrSchema.users.email,
    teacher_phone: hrSchema.users.phone,
    teacher_image: hrSchema.users.image,
    department_head: department_teachers.department_head,
    education: department_teachers.education,
    publication: department_teachers.publication,
    journal: department_teachers.journal,
    appointment_date: department_teachers.appointment_date,
    resign_date: department_teachers.resign_date,
    about: department_teachers.about,
    created_at: department_teachers.created_at,
    updated_at: department_teachers.updated_at,
    created_by: department_teachers.created_by,
    created_by_name: createdByUser.name,
    remarks: department_teachers.remarks,
  })
    .from(department_teachers)
    .leftJoin(department, eq(department_teachers.department_uuid, department.uuid))
    .leftJoin(hrSchema.users, eq(department_teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(createdByUser, eq(department_teachers.created_by, createdByUser.uuid));

  if (portfolio_department)
    resultPromise.where(eq(department.name, portfolio_department));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: department_teachers.id,
    uuid: department_teachers.uuid,
    department_uuid: department_teachers.department_uuid,
    department_name: department.name,
    teacher_uuid: department_teachers.teacher_uuid,
    teacher_name: hrSchema.users.name,
    teacher_designation: hrSchema.designation.name,
    teacher_email: hrSchema.users.email,
    teacher_phone: hrSchema.users.phone,
    teacher_image: hrSchema.users.image,
    department_head: department_teachers.department_head,
    education: department_teachers.education,
    publication: department_teachers.publication,
    journal: department_teachers.journal,
    appointment_date: department_teachers.appointment_date,
    resign_date: department_teachers.resign_date,
    about: department_teachers.about,
    created_at: department_teachers.created_at,
    updated_at: department_teachers.updated_at,
    created_by: department_teachers.created_by,
    created_by_name: createdByUser.name,
    remarks: department_teachers.remarks,
  })
    .from(department_teachers)
    .leftJoin(department, eq(department_teachers.department_uuid, department.uuid))
    .leftJoin(hrSchema.users, eq(department_teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(createdByUser, eq(department_teachers.created_by, createdByUser.uuid))
    .where(eq(department_teachers.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
