import type { AppRouteHandler } from '@/lib/types';

import { desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { designation, users } from '@/routes/hr/schema';
import { department_teachers, department as portfolioDepartment, teachers } from '@/routes/portfolio/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { info_extra } from '../schema';

// const updatedByUser = alias(users, 'updated_by_user');
const teacherUser = alias(users, 'teacher_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(info_extra).values(value).returning({
    name: info_extra.uuid,
  });
  if (!data)
    return DataNotFound(c);

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(info_extra)
    .set(updates)
    .where(eq(info_extra.uuid, uuid))
    .returning({
      name: info_extra.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(info_extra)
    .where(eq(info_extra.uuid, uuid))
    .returning({
      name: info_extra.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.info_extra.findMany();
  const { type } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: info_extra.uuid,
    id: info_extra.id,
    teachers_uuid: info_extra.teachers_uuid,
    teacher_name: teacherUser.name,
    teacher_phone: teachers.teacher_phone,
    teacher_email: teachers.teacher_email,
    teacher_image: teacherUser.image,
    teacher_department: sql<string>`string_agg(DISTINCT ${portfolioDepartment.uuid}::text, ', ')`,
    teacher_department_name: sql<string>`string_agg(DISTINCT ${portfolioDepartment.name}, ', ')`,
    teacher_designation: teacherUser.designation_uuid,
    teacher_designation_name: designation.name,
    description: info_extra.description,
    type: info_extra.type,
    created_by: info_extra.created_by,
    created_by_name: users.name,
    created_at: info_extra.created_at,
    updated_at: info_extra.updated_at,
    remarks: info_extra.remarks,
  })
    .from(info_extra)
    .leftJoin(users, eq(users.uuid, info_extra.created_by))
    .leftJoin(teachers, eq(teachers.uuid, info_extra.teachers_uuid))
    .leftJoin(teacherUser, eq(teacherUser.uuid, teachers.teacher_uuid))
    .leftJoin(department_teachers, eq(department_teachers.teachers_uuid, teachers.uuid))
    .leftJoin(portfolioDepartment, eq(portfolioDepartment.uuid, department_teachers.department_uuid))
    .leftJoin(designation, eq(designation.uuid, teacherUser.designation_uuid))
    .where(type ? eq(info_extra.type, type) : undefined)
    .groupBy(
      info_extra.uuid,
      info_extra.id,
      info_extra.teachers_uuid,
      teacherUser.name,
      teachers.teacher_phone,
      teachers.teacher_email,
      teacherUser.image,
      teacherUser.designation_uuid,
      designation.name,
      info_extra.description,
      info_extra.type,
      info_extra.created_by,
      users.name,
      info_extra.created_at,
      info_extra.updated_at,
      info_extra.remarks,
    )
    .orderBy(desc(info_extra.created_at));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.select({
    uuid: info_extra.uuid,
    id: info_extra.id,
    teachers_uuid: info_extra.teachers_uuid,
    teacher_name: teacherUser.name,
    teacher_phone: teachers.teacher_phone,
    teacher_email: teachers.teacher_email,
    teacher_image: teacherUser.image,
    teacher_department: sql<string>`string_agg(DISTINCT ${portfolioDepartment.uuid}::text, ', ')`,
    teacher_department_name: sql<string>`string_agg(DISTINCT ${portfolioDepartment.name}, ', ')`,
    teacher_designation: teacherUser.designation_uuid,
    teacher_designation_name: designation.name,
    description: info_extra.description,
    type: info_extra.type,
    created_by: info_extra.created_by,
    created_by_name: users.name,
    created_at: info_extra.created_at,
    updated_at: info_extra.updated_at,
    remarks: info_extra.remarks,
  })
    .from(info_extra)
    .leftJoin(users, eq(users.uuid, info_extra.created_by))
    .leftJoin(teachers, eq(teachers.uuid, info_extra.teachers_uuid))
    .leftJoin(teacherUser, eq(teacherUser.uuid, teachers.teacher_uuid))
    .leftJoin(department_teachers, eq(department_teachers.teachers_uuid, teachers.uuid))
    .leftJoin(portfolioDepartment, eq(portfolioDepartment.uuid, department_teachers.department_uuid))
    .leftJoin(designation, eq(designation.uuid, teacherUser.designation_uuid))
    .where(eq(info_extra.uuid, uuid))
    .groupBy(
      info_extra.uuid,
      info_extra.id,
      info_extra.teachers_uuid,
      teacherUser.name,
      teachers.teacher_phone,
      teachers.teacher_email,
      teacherUser.image,
      teacherUser.designation_uuid,
      designation.name,
      info_extra.description,
      info_extra.type,
      info_extra.created_by,
      users.name,
      info_extra.created_at,
      info_extra.updated_at,
      info_extra.remarks,
    );

  if (!data)
    return DataNotFound(c);

  return c.json(data, HSCode.OK);
};
