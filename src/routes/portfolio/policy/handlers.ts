import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { constructSelectAllQuery } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from './routes';

import { policy } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const formData = await c.req.parseBody();

  const file = formData.file;

  let filePath = null;

  if (file && typeof file === 'object') {
    filePath = await insertFile(file, 'public/policy');
  }

  const value = {
    uuid: formData.uuid,
    serial: formData.serial,
    name: formData.name,
    department: formData.department,
    published_date: formData.published_date,
    file: filePath,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    created_by: formData.created_by,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(policy).values(value).returning({
    name: policy.name,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // file
  // updates includes file then do it else exclude it
  if (formData.file && typeof formData.file === 'object') {
    // get policy file name
    const policyData = await db.query.policy.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (policyData && policyData.file) {
      const filePath = await updateFile(formData.file, policyData.file, 'public/policy');
      formData.file = filePath;
    }
    else {
      const filePath = await insertFile(formData.file, 'public/policy');
      formData.file = filePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db
    .update(policy)
    .set(formData)
    .where(eq(policy.uuid, uuid))
    .returning({
      name: policy.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get policy file name

  const policyData = await db.query.policy.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (policyData && policyData.file) {
    deleteFile(policyData.file);
  }

  const [data] = await db
    .delete(policy)
    .where(eq(policy.uuid, uuid))
    .returning({
      name: policy.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.policy.findMany();

  const { is_pagination, field_name, field_value } = c.req.valid('query');

  const resultPromise = db.select({
    id: policy.id,
    uuid: policy.uuid,
    name: policy.name,
    department: policy.department,
    file: policy.file,
    published_date: policy.published_date,
    created_at: policy.created_at,
    updated_at: policy.updated_at,
    created_by: policy.created_by,
    created_by_name: hrSchema.users.name,
    remarks: policy.remarks,
  })
    .from(policy)
    .leftJoin(hrSchema.users, eq(policy.created_by, hrSchema.users.uuid));

  const resultPromiseForCount = await resultPromise;

  const limit = Number.parseInt(c.req.valid('query').limit);
  const page = Number.parseInt(c.req.valid('query').page);

  const baseQuery = is_pagination === 'false'
    ? resultPromise
    : constructSelectAllQuery(resultPromise, c.req.valid('query'), 'created_at', [hrSchema.users.name.name], field_name, field_value);

  const data = await baseQuery;

  const pagination = is_pagination === 'false'
    ? null
    : {
        total_record: resultPromiseForCount.length,
        current_page: Number(page),
        total_page: Math.ceil(resultPromiseForCount.length / limit),
        next_page: page > Math.ceil(resultPromiseForCount.length / limit) ? null : page + 1,
        prev_page: page - 1 <= 0 ? null : page - 1,
      };

  const response = is_pagination === 'false'
    ? data
    : {
        data,
        pagination,
      };

  return c.json(response || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: policy.id,
    uuid: policy.uuid,
    name: policy.name,
    department: policy.department,
    file: policy.file,
    published_date: policy.published_date,
    created_at: policy.created_at,
    updated_at: policy.updated_at,
    created_by: policy.created_by,
    created_by_name: hrSchema.users.name,
    remarks: policy.remarks,
  })
    .from(policy)
    .leftJoin(hrSchema.users, eq(policy.created_by, hrSchema.users.uuid))
    .where(eq(policy.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
