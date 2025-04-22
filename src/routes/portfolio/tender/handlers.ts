import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
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

import { tender } from '../schema';

// const user_information = alias(hrSchema.users, 'user_information');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');
  const formData = await c.req.parseBody();
  const file = formData.file;

  let filePath = null;

  if (file && typeof file === 'object') {
    filePath = await insertFile(file, 'public/tender');
  }

  const value = {
    uuid: formData.uuid,
    table_name: formData.table_name,
    code: formData.code,
    type: formData.type,
    title: formData.title,
    published_date: formData.published_date,
    file: filePath,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    created_by: formData.created_by,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(tender).values(value).returning({
    name: tender.title,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // updates includes image then do it else exclude it

  if (formData.image && typeof formData.image === 'object') {
    // get tender image name

    const tenderData = await db.query.tender.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (tenderData && tenderData.file) {
      const filePath = await updateFile(formData.file, tenderData.file, 'public/tender');
      formData.file = filePath;
    }
    else {
      const filePath = await insertFile(formData.file, 'public/tender');
      formData.file = filePath;
    }
  }
  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db
    .update(tender)
    .set(formData)
    .where(eq(tender.uuid, uuid))
    .returning({
      name: tender.created_by,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const tenderData = await db.query.tender.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (tenderData && tenderData.file) {
    deleteFile(tenderData.file);
  }

  const [data] = await db
    .delete(tender)
    .where(eq(tender.uuid, uuid))
    .returning({
      name: tender.created_by,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { is_pagination, table_name, field_name, field_value } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: tender.uuid,
    table_name: tender.table_name,
    code: tender.code,
    type: tender.type,
    title: tender.title,
    published_date: tender.published_date,
    file: tender.file,
    created_at: tender.created_at,
    updated_at: tender.updated_at,
    created_by: tender.created_by,
    created_by_name: hrSchema.users.name,
    remarks: tender.remarks,
  })
    .from(tender)
    .leftJoin(hrSchema.users, eq(tender.created_by, hrSchema.users.uuid));

  const resultPromiseForCount = await resultPromise;

  const limit = Number.parseInt(c.req.valid('query').limit);
  const page = Number.parseInt(c.req.valid('query').page);

  const baseQuery = is_pagination === 'false'
    ? resultPromise
    : constructSelectAllQuery(resultPromise, c.req.valid('query'), 'created_at', [hrSchema.users.name.name], field_name, field_value);

  if (table_name) {
    baseQuery.groupBy(tender.uuid, hrSchema.users.name);
    baseQuery.having(eq(tender.table_name, table_name));
  }

  const data = await baseQuery;

  const pagination = is_pagination === 'false'
    ? null
    : {
        total_record: resultPromiseForCount.length,
        current_page: Number(page),
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

  const data = await db.query.tender.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
