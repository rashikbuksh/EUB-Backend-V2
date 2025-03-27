import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

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
