import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { uploadFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department, faculty, info } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const file = formData.file;

  const filePath = await uploadFile(file, 'public/info');

  const value = {
    uuid: formData.uuid,
    description: formData.description,
    page_name: formData.page_name,
    department_uuid: formData.department_uuid,
    file: filePath,
    is_global: formData.is_global,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    created_by: formData.created_by,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(info).values(value).returning({
    name: info.created_by,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(info)
    .set(updates)
    .where(eq(info.uuid, uuid))
    .returning({
      name: info.created_by,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(info)
    .where(eq(info.uuid, uuid))
    .returning({
      name: info.created_by,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { page_name } = c.req.valid('query');

  const resultPromise = db.select({
    id: info.id,
    uuid: info.uuid,
    description: info.description,
    page_name: info.page_name,
    department_uuid: info.department_uuid,
    department_name: department.name,
    faculty_uuid: faculty.uuid,
    faculty_name: faculty.name,
    file: info.file,
    is_global: info.is_global,
    created_by: info.created_by,
    created_at: info.created_at,
    updated_at: info.updated_at,
  })
    .from(info)
    .leftJoin(department, eq(info.department_uuid, department.uuid))
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid));

  if (page_name) {
    resultPromise.where(eq(info.page_name, page_name));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.info.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
