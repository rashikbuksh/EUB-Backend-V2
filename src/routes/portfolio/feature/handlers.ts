import type { AppRouteHandler } from '@/lib/types';

import { asc, eq } from 'drizzle-orm';
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

import { feature } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const formData = await c.req.parseBody();

  const file = formData.file;

  let filePath = null;

  if (file && typeof file === 'object') {
    filePath = await insertFile(file, 'public/feature');
  }

  const value = {
    uuid: formData.uuid,
    index: formData.index,
    title: formData.title,
    description: formData.description,
    file: filePath,
    is_active: formData.is_active,
    created_by: formData.created_by,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(feature).values(value).returning({
    name: feature.title,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // file
  // updates includes file then do it else exclude it
  if (formData.file && typeof formData.file === 'object') {
    // get feature file name
    const featureData = await db.query.feature.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (featureData && featureData.file) {
      const filePath = await updateFile(formData.file, featureData.file, 'public/feature');
      formData.file = filePath;
    }
    else {
      const filePath = await insertFile(formData.file, 'public/feature');
      formData.file = filePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db
    .update(feature)
    .set(formData)
    .where(eq(feature.uuid, uuid))
    .returning({
      name: feature.title,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get feature file name

  const featureData = await db.query.feature.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (featureData && featureData.file) {
    deleteFile(featureData.file);
  }

  const [data] = await db
    .delete(feature)
    .where(eq(feature.uuid, uuid))
    .returning({
      name: feature.title,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.feature.findMany();

  const { is_pagination } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: feature.uuid,
    index: feature.index,
    title: feature.title,
    description: feature.description,
    file: feature.file,
    is_active: feature.is_active,
    created_at: feature.created_at,
    updated_at: feature.updated_at,
    created_by: feature.created_by,
    created_by_name: hrSchema.users.name,
    remarks: feature.remarks,
  })
    .from(feature)
    .leftJoin(hrSchema.users, eq(feature.created_by, hrSchema.users.uuid));

  const resultPromiseForCount = await resultPromise;

  const limit = Number.parseInt(c.req.valid('query').limit);
  const page = Number.parseInt(c.req.valid('query').page);

  const baseQuery = is_pagination === 'false'
    ? resultPromise.orderBy(asc(feature.index))
    : constructSelectAllQuery(resultPromise, c.req.valid('query'), 'created_at', [hrSchema.users.name.name]);

  const data = await baseQuery;

  const pagination = is_pagination === 'false'
    ? null
    : {
        total_record: resultPromiseForCount.length,
        current_page: page,
        total_page: Math.ceil(resultPromiseForCount.length / limit),
        next_page: page + 1 > Math.ceil(resultPromiseForCount.length / limit) ? null : page + 1,
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
    uuid: feature.uuid,
    index: feature.index,
    title: feature.title,
    description: feature.description,
    file: feature.file,
    is_active: feature.is_active,
    created_at: feature.created_at,
    updated_at: feature.updated_at,
    created_by: feature.created_by,
    created_by_name: hrSchema.users.name,
    remarks: feature.remarks,
  })
    .from(feature)
    .leftJoin(hrSchema.users, eq(feature.created_by, hrSchema.users.uuid))
    .where(eq(feature.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
