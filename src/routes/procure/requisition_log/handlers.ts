import type { AppRouteHandler } from '@/lib/types';

import { desc, eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { requisition, requisition_log } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(requisition_log).values(
    value,
  ).returning({
    name: requisition_log.id,
  });

  if (!data)
    return ObjectNotFound(c);

  return c.json(createToast('create', data?.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { id } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(requisition_log)
    .set(updates)
    .where(eq(requisition_log.id, id))
    .returning({
      name: requisition_log.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { id } = c.req.valid('param');

  const [data] = await db.delete(requisition_log)
    .where(eq(requisition_log.id, id))
    .returning({
      name: requisition_log.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { user_uuid } = c.req.valid('query');

  const resultPromise = db.select({
    id: requisition_log.id,
    requisition_id: sql`CONCAT('RI', TO_CHAR(${requisition.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${requisition.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${requisition.id}, 'FM0000'))`,
    requisition_uuid: requisition_log.requisition_uuid,
    is_received: requisition_log.is_received,
    received_date: requisition_log.received_date,
    created_at: requisition_log.created_at,
    created_by: requisition_log.created_by,
    created_by_name: hrSchema.users.name,
  })
    .from(requisition_log)
    .leftJoin(hrSchema.users, eq(requisition_log.created_by, hrSchema.users.uuid))
    .leftJoin(requisition, eq(requisition_log.requisition_uuid, requisition.uuid))
    .orderBy(desc(requisition_log.created_at));

  if (user_uuid) {
    resultPromise.where(eq(requisition_log.created_by, user_uuid));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { id } = c.req.valid('param');

  const data = await db.query.requisition_log.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
