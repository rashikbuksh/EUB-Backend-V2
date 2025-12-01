import type { AppRouteHandler } from '@/lib/types';

import { desc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { designation, users } from '@/routes/hr/schema';
import { department_teachers, department as portfolioDepartment, teachers } from '@/routes/portfolio/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { boards } from '../schema';

const updatedByUser = alias(users, 'updated_by_user');
const teacherUser = alias(users, 'teacher_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(boards).values(value).returning({
    name: boards.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(boards)
    .set(updates)
    .where(eq(boards.uuid, uuid))
    .returning({
      name: boards.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(boards)
    .where(eq(boards.uuid, uuid))
    .returning({
      name: boards.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.boards.findMany();
  const { type } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: boards.uuid,
    teachers_uuid: boards.teachers_uuid,
    teacher_name: teacherUser.name,
    teacher_phone: teachers.teacher_phone,
    teacher_email: teachers.teacher_email,
    teacher_image: teacherUser.image,
    teacher_department: portfolioDepartment.uuid,
    teacher_department_name: portfolioDepartment.name,
    teacher_designation: teacherUser.designation_uuid,
    teacher_designation_name: designation.name,
    is_chief: boards.is_chief,
    type: boards.type,
    description: boards.description,
    created_by: boards.created_by,
    created_by_name: users.name,
    created_at: boards.created_at,
    update_by: boards.updated_by,
    updated_by_name: updatedByUser.name,
    updated_at: boards.updated_at,
    remarks: boards.remarks,
  })
    .from(boards)
    .leftJoin(users, eq(users.uuid, boards.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, boards.updated_by))
    .leftJoin(teachers, eq(teachers.uuid, boards.teachers_uuid))
    .leftJoin(teacherUser, eq(teacherUser.uuid, teachers.teacher_uuid))
    .leftJoin(department_teachers, eq(department_teachers.teachers_uuid, teachers.uuid))
    .leftJoin(portfolioDepartment, eq(portfolioDepartment.uuid, department_teachers.department_uuid))
    .leftJoin(designation, eq(designation.uuid, teacherUser.designation_uuid))
    .where(type ? eq(boards.type, type) : undefined)
    .orderBy(desc(boards.created_at));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.select({
    uuid: boards.uuid,
    teachers_uuid: boards.teachers_uuid,
    teacher_name: teacherUser.name,
    teacher_phone: teachers.teacher_phone,
    teacher_email: teachers.teacher_email,
    teacher_image: teacherUser.image,
    teacher_department: portfolioDepartment.uuid,
    teacher_department_name: portfolioDepartment.name,
    teacher_designation: teacherUser.designation_uuid,
    teacher_designation_name: designation.name,
    is_chief: boards.is_chief,
    type: boards.type,
    description: boards.description,
    created_by: boards.created_by,
    created_by_name: users.name,
    created_at: boards.created_at,
    update_by: boards.updated_by,
    updated_by_name: updatedByUser.name,
    updated_at: boards.updated_at,
    remarks: boards.remarks,
  })
    .from(boards)
    .leftJoin(users, eq(users.uuid, boards.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, boards.updated_by))
    .leftJoin(teachers, eq(teachers.uuid, boards.teachers_uuid))
    .leftJoin(teacherUser, eq(teacherUser.uuid, teachers.teacher_uuid))
    .leftJoin(department_teachers, eq(department_teachers.teachers_uuid, teachers.uuid))
    .leftJoin(portfolioDepartment, eq(portfolioDepartment.uuid, department_teachers.department_uuid))
    .leftJoin(designation, eq(designation.uuid, teacherUser.designation_uuid))
    .where(eq(boards.uuid, uuid));

  if (!data)
    return DataNotFound(c);

  return c.json(data, HSCode.OK);
};
