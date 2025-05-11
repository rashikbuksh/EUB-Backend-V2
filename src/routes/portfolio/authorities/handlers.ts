import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneByCategoryRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { authorities, teachers } from '../schema';

const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(authorities).values(value).returning({
    name: authorities.user_uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(authorities)
    .set(updates)
    .where(eq(authorities.uuid, uuid))
    .returning({
      name: authorities.user_uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(authorities)
    .where(eq(authorities.uuid, uuid))
    .returning({
      name: authorities.user_uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { category } = c.req.valid('query');

  const resultPromise = db.select({
    id: authorities.id,
    uuid: authorities.uuid,
    user_uuid: authorities.user_uuid,
    user_name: hrSchema.users.name,
    category: authorities.category,
    short_biography: authorities.short_biography,
    created_at: authorities.created_at,
    updated_at: authorities.updated_at,
    personal_info: sql`jsonb_build_object('name', ${hrSchema.users.name}, 'title', ${hrSchema.designation.name}, 'profile_image', ${hrSchema.users.image}, 'department', ${hrSchema.department.name})`,
    image: hrSchema.users.image,
    education: teachers.education,
    contact: sql`jsonb_build_object('email', ${authorities.email}, 'phone', ${authorities.phone})`,
    created_by: authorities.created_by,
    created_by_name: created_user.name,
    remarks: authorities.remarks,
    email: authorities.email,
    phone: authorities.phone,

  })
    .from(authorities)
    .leftJoin(hrSchema.users, eq(authorities.user_uuid, hrSchema.users.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(hrSchema.department, eq(hrSchema.users.department_uuid, hrSchema.department.uuid))
    .leftJoin(teachers, eq(authorities.user_uuid, teachers.teacher_uuid))
    .leftJoin(created_user, eq(authorities.created_by, created_user.uuid));

  if (category) {
    resultPromise.where(eq(authorities.category, category));
  }

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.authorities.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};

export const getOneByCategory: AppRouteHandler<GetOneByCategoryRoute> = async (c: any) => {
  const { category } = c.req.valid('param');

  const resultPromise = db.select({
    id: authorities.id,
    uuid: authorities.uuid,
    user_uuid: authorities.user_uuid,
    user_name: hrSchema.users.name,
    category: authorities.category,
    short_biography: authorities.short_biography,
    created_at: authorities.created_at,
    updated_at: authorities.updated_at,
    personal_info: sql`jsonb_build_object('name', ${hrSchema.users.name}, 'title', ${hrSchema.designation.name}, 'profile_image', ${hrSchema.users.image}, 'department', ${hrSchema.department.name})`,
    image: hrSchema.users.image,
    education: teachers.education,
    contact: sql`jsonb_build_object('email', ${authorities.email}, 'phone', ${authorities.phone})`,
    created_by: authorities.created_by,
    created_by_name: created_user.name,
    remarks: authorities.remarks,
    email: authorities.email,
    phone: authorities.phone,
  })
    .from(authorities)
    .leftJoin(hrSchema.users, eq(authorities.user_uuid, hrSchema.users.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(hrSchema.department, eq(hrSchema.users.department_uuid, hrSchema.department.uuid))
    .leftJoin(teachers, eq(hrSchema.users.uuid, teachers.teacher_uuid))
    .leftJoin(created_user, eq(authorities.created_by, created_user.uuid))
    .where(eq(authorities.category, category));

  const data: any[] = await resultPromise;

  return c.json(data[0] || null, HSCode.OK);
};
