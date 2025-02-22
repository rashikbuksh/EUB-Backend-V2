import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { club, department, faculty } from '../schema';

const createdByUser = alias(hrSchema.users, 'createdByUser');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(club).values(value).returning({
    name: club.id,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(club)
    .set(updates)
    .where(eq(club.uuid, uuid))
    .returning({
      name: club.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(club)
    .where(eq(club.uuid, uuid))
    .returning({
      name: club.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { portfolio_faculty } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: club.uuid,
    id: club.id,
    name: club.name,
    department_uuid: club.department_uuid,
    department_name: department.name,
    faculty_uuid: faculty.uuid,
    faculty_name: faculty.name,
    president_uuid: club.president_uuid,
    president_name: hrSchema.users.name,
    president_email: club.email,
    president_phone: club.phone,
    president_image: hrSchema.users.image,
    president_designation: hrSchema.designation.name,
    message: club.message,
    created_at: club.created_at,
    updated_at: club.updated_at,
    created_by: club.created_by,
    created_by_name: createdByUser.name,
    remarks: club.remarks,
  })
    .from(club)
    .leftJoin(department, eq(club.department_uuid, department.uuid))
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid))
    .leftJoin(hrSchema.users, eq(club.president_uuid, hrSchema.users.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(createdByUser, eq(club.created_by, createdByUser.uuid));

  if (portfolio_faculty)
    resultPromise.where(eq(faculty.name, portfolio_faculty));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: club.uuid,
    id: club.id,
    name: club.name,
    department_uuid: club.department_uuid,
    department_name: department.name,
    faculty_uuid: faculty.uuid,
    faculty_name: faculty.name,
    president_uuid: club.president_uuid,
    president_name: hrSchema.users.name,
    president_email: club.email,
    president_phone: club.phone,
    president_image: hrSchema.users.image,
    president_designation: hrSchema.designation.name,
    message: club.message,
    created_at: club.created_at,
    updated_at: club.updated_at,
    created_by: club.created_by,
    created_by_name: createdByUser.name,
    remarks: club.remarks,
  })
    .from(club)
    .leftJoin(department, eq(club.department_uuid, department.uuid))
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid))
    .leftJoin(hrSchema.users, eq(club.president_uuid, hrSchema.users.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(createdByUser, eq(club.created_by, createdByUser.uuid))
    .where(eq(club.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
