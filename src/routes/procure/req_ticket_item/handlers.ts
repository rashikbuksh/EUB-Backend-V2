import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { item, req_ticket, req_ticket_item } from '../schema';

const updated_user = alias(hrSchema.users, 'updated_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(req_ticket_item).values(value).returning({
    name: req_ticket_item.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(req_ticket_item)
    .set(updates)
    .where(eq(req_ticket_item.uuid, uuid))
    .returning({
      name: req_ticket_item.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(req_ticket_item)
    .where(eq(req_ticket_item.uuid, uuid))
    .returning({
      name: req_ticket_item.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: req_ticket_item.uuid,
    req_ticket_uuid: req_ticket_item.req_ticket_uuid,
    item_uuid: req_ticket_item.item_uuid,
    quantity: req_ticket_item.quantity,
    created_at: req_ticket_item.created_at,
    created_by: req_ticket_item.created_by,
    created_by_name: hrSchema.users.name,
    updated_at: req_ticket_item.updated_at,
    updated_by: req_ticket_item.updated_by,
    updated_by_name: updated_user.name,
    remarks: req_ticket_item.remarks,
  })
    .from(req_ticket_item)
    .leftJoin(item, eq(req_ticket_item.item_uuid, item.uuid))
    .leftJoin(req_ticket, eq(req_ticket_item.req_ticket_uuid, req_ticket.uuid))
    .leftJoin(hrSchema.users, eq(req_ticket_item.created_by, hrSchema.users.uuid))
    .leftJoin(updated_user, eq(req_ticket_item.updated_by, updated_user.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: req_ticket_item.uuid,
    req_ticket_uuid: req_ticket_item.req_ticket_uuid,
    item_uuid: req_ticket_item.item_uuid,
    quantity: req_ticket_item.quantity,
    created_at: req_ticket_item.created_at,
    created_by: req_ticket_item.created_by,
    created_by_name: hrSchema.users.name,
    updated_at: req_ticket_item.updated_at,
    updated_by: req_ticket_item.updated_by,
    updated_by_name: updated_user.name,
    remarks: req_ticket_item.remarks,
  })
    .from(req_ticket_item)
    .leftJoin(item, eq(req_ticket_item.item_uuid, item.uuid))
    .leftJoin(req_ticket, eq(req_ticket_item.req_ticket_uuid, req_ticket.uuid))
    .leftJoin(hrSchema.users, eq(req_ticket_item.created_by, hrSchema.users.uuid))
    .leftJoin(updated_user, eq(req_ticket_item.updated_by, updated_user.uuid))
    .where(eq(req_ticket_item.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
