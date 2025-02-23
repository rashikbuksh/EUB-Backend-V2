import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type {
  CreateRoute,
  GetByOfficeUuidRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from './routes';

import { office, office_entry } from '../schema';

const user_information = alias(hrSchema.users, 'user_information');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(office_entry).values(value).returning({
    name: office_entry.id,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db
    .update(office_entry)
    .set(updates)
    .where(eq(office_entry.uuid, uuid))
    .returning({
      name: office_entry.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db
    .delete(office_entry)
    .where(eq(office_entry.uuid, uuid))
    .returning({
      name: office_entry.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { category } = c.req.valid('query');

  const resultPromise = db.select({
    id: office_entry.id,
    uuid: office_entry.uuid,
    office_uuid: office_entry.office_uuid,
    office_category: office.category,
    user_uuid: office_entry.user_uuid,
    user_name: user_information.name,
    user_department: hrSchema.department.name,
    user_designation: office_entry.designation,
    user_phone: office_entry.user_phone,
    user_email: office_entry.user_email,
    image: user_information.image,
    created_at: office_entry.created_at,
    created_by: office_entry.created_by,
    created_by_name: hrSchema.users.name,
    updated_at: office_entry.updated_at,
    remarks: office_entry.remarks,
  })
    .from(office_entry)
    .leftJoin(office, eq(office_entry.office_uuid, office.uuid))
    .leftJoin(user_information, eq(office_entry.user_uuid, user_information.uuid))
    .leftJoin(hrSchema.department, eq(user_information.department_uuid, hrSchema.department.uuid))
    .leftJoin(hrSchema.designation, eq(user_information.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(hrSchema.users, eq(office_entry.created_by, hrSchema.users.uuid));

  if (category)
    resultPromise.where(eq(office.category, category));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.office_entry.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};

export const getByOfficeUuid: AppRouteHandler<GetByOfficeUuidRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: office_entry.id,
    uuid: office_entry.uuid,
    office_uuid: office_entry.office_uuid,
    office_category: office.category,
    user_uuid: office_entry.user_uuid,
    user_name: user_information.name,
    user_department: hrSchema.department.name,
    user_designation: office_entry.designation,
    user_phone: office_entry.user_phone,
    user_email: office_entry.user_email,
    image: user_information.image,
    created_at: office_entry.created_at,
    created_by: office_entry.created_by,
    created_by_name: hrSchema.users.name,
    updated_at: office_entry.updated_at,
    remarks: office_entry.remarks,
  })
    .from(office_entry)
    .leftJoin(office, eq(office_entry.office_uuid, office.uuid))
    .leftJoin(user_information, eq(office_entry.user_uuid, user_information.uuid))
    .leftJoin(hrSchema.users, eq(office_entry.created_by, hrSchema.users.uuid))
    .leftJoin(hrSchema.department, eq(user_information.department_uuid, hrSchema.department.uuid))
    .leftJoin(hrSchema.designation, eq(user_information.designation_uuid, hrSchema.designation.uuid))
    .where(eq(office_entry.office_uuid, uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};
