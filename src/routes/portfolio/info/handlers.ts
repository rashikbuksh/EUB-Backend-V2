import type { AppRouteHandler } from '@/lib/types';

import { eq, inArray } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { constructSelectAllQuery } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { info } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const file = formData.file;

  const filePath = await insertFile(file, 'public/info');

  const value = {
    uuid: formData.uuid,
    description: formData.description,
    page_name: formData.page_name,
    file: filePath,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    created_by: formData.created_by,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(info).values(value).returning({
    name: info.id,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // updates includes file then do it else exclude it
  if (formData.file) {
    // get info file name
    const infoData = await db.query.info.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (infoData && infoData.file) {
      const filePath = await updateFile(formData.file, infoData.file, 'public/info');
      formData.file = filePath;
    }
    else {
      const filePath = await insertFile(formData.file, 'public/info');
      formData.file = filePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(info)
    .set(formData)
    .where(eq(info.uuid, uuid))
    .returning({
      name: info.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get info file name

  const infoData = await db.query.info.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (infoData && infoData.file) {
    deleteFile(infoData.file);
  }

  const [data] = await db.delete(info)
    .where(eq(info.uuid, uuid))
    .returning({
      name: info.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { page_name, access, is_pagination } = c.req.valid('query');

  let accessArray = [];
  if (access) {
    accessArray = access.split(',');
  }

  const resultPromise = db.select({
    id: info.id,
    uuid: info.uuid,
    description: info.description,
    page_name: info.page_name,
    file: info.file,
    created_by: info.created_by,
    created_by_name: hrSchema.users.name,
    created_at: info.created_at,
    updated_at: info.updated_at,
  })
    .from(info)
    .leftJoin(hrSchema.users, eq(info.created_by, hrSchema.users.uuid));

  if (page_name) {
    resultPromise.where(eq(info.page_name, page_name));
  }
  if (access) {
    resultPromise.where(inArray(info.page_name, accessArray));
  }

  const resultPromiseForCount = await resultPromise;

  const limit = Number.parseInt(c.req.valid('query').limit);
  const page = Number.parseInt(c.req.valid('query').page);

  const baseQuery = is_pagination === 'true'
    ? constructSelectAllQuery(resultPromise, c.req.valid('query'), 'created_at', [hrSchema.users.name.name])
    : resultPromise;

  const data = await baseQuery;

  const pagination = is_pagination === 'true'
    ? {
        total_record: resultPromiseForCount.length,
        current_page: page,
        total_page: Math.ceil(resultPromiseForCount.length / limit),
        next_page: page + 1 > Math.ceil(resultPromiseForCount.length / limit) ? null : page + 1,
        prev_page: page - 1 <= 0 ? null : page - 1,
      }
    : null;

  const response = is_pagination === 'true'
    ? {
        data,
        pagination,
      }
    : data;

  return c.json(response || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: info.id,
    uuid: info.uuid,
    description: info.description,
    page_name: info.page_name,
    file: info.file,
    created_by: info.created_by,
    created_by_name: hrSchema.users.name,
    created_at: info.created_at,
    updated_at: info.updated_at,
  })
    .from(info)
    .leftJoin(hrSchema.users, eq(info.created_by, hrSchema.users.uuid))
    .where(eq(info.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
