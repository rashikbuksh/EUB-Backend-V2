import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
// import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { capital, capital_item, item } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(capital_item).values(value).returning({
    name: capital_item.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(capital_item)
    .set(updates)
    .where(eq(capital_item.uuid, uuid))
    .returning({
      name: capital_item.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(capital_item)
    .where(eq(capital_item.uuid, uuid))
    .returning({
      name: capital_item.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: capital_item.uuid,
    capital_uuid: capital_item.capital_uuid,
    capital_name: capital.name,
    item_uuid: capital_item.item_uuid,
    item_name: item.name,
    quantity: PG_DECIMAL_TO_FLOAT(capital_item.quantity),
    created_at: capital_item.created_at,
    updated_at: capital_item.updated_at,
    created_by: capital_item.created_by,
    created_by_name: hrSchema.users.name,
    remarks: capital_item.remarks,
  })
    .from(capital_item)
    .leftJoin(hrSchema.users, eq(capital_item.created_by, hrSchema.users.uuid))
    .leftJoin(capital, eq(capital_item.capital_uuid, capital.uuid))
    .leftJoin(item, eq(capital_item.item_uuid, item.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.capital_item.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
