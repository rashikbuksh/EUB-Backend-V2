import type { AppRouteHandler } from '@/lib/types';

import { and, eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { req_ticket } from '../schema';

const updated_user = alias(hrSchema.users, 'updated_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(req_ticket).values(value).returning({
    name: req_ticket.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(req_ticket)
    .set(updates)
    .where(eq(req_ticket.uuid, uuid))
    .returning({
      name: req_ticket.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(req_ticket)
    .where(eq(req_ticket.uuid, uuid))
    .returning({
      name: req_ticket.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { store_type } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: req_ticket.uuid,
    id: req_ticket.id,
    req_ticket_id: sql`CONCAT('RT', TO_CHAR(${req_ticket.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${req_ticket.created_at}::timestamp, 'MM'), '-',  ${req_ticket.id})`,
    department: req_ticket.department,
    problem_description: req_ticket.problem_description,
    is_resolved: req_ticket.is_resolved,
    is_resolved_date: req_ticket.is_resolved_date,
    created_at: req_ticket.created_at,
    created_by: req_ticket.created_by,
    created_by_name: hrSchema.users.name,
    updated_at: req_ticket.updated_at,
    updated_by: req_ticket.updated_by,
    updated_by_name: updated_user.name,
    remarks: req_ticket.remarks,
    items: sql`(
      SELECT array_agg(t.item_name)
      FROM (
        SELECT
          rti.uuid,
          rti.req_ticket_uuid,
          it.name as item_name
        FROM procure.req_ticket_item rti
        LEFT JOIN procure.item it ON rti.item_uuid = it.uuid
        WHERE rti.req_ticket_uuid = ${req_ticket.uuid}
      ) t
    )`,
  })
    .from(req_ticket)
    .leftJoin(hrSchema.users, eq(req_ticket.created_by, hrSchema.users.uuid))
    .leftJoin(updated_user, eq(req_ticket.updated_by, updated_user.uuid));

  const filters = [];

  if (store_type) {
    const store_type_array = store_type.split(',');
    if (store_type_array.length > 1) {
      filters.push(inArray(req_ticket.department, store_type_array));
    }
    else {
      filters.push(eq(req_ticket.department, store_type));
    }
  }

  if (filters.length > 0) {
    resultPromise.where(and(...filters));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: req_ticket.uuid,
    id: req_ticket.id,
    req_ticket_id: sql`CONCAT('RT', TO_CHAR(${req_ticket.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${req_ticket.created_at}::timestamp, 'MM'), '-',  ${req_ticket.id})`,
    department: req_ticket.department,
    problem_description: req_ticket.problem_description,
    is_resolved: req_ticket.is_resolved,
    is_resolved_date: req_ticket.is_resolved_date,
    created_at: req_ticket.created_at,
    created_by: req_ticket.created_by,
    created_by_name: hrSchema.users.name,
    updated_at: req_ticket.updated_at,
    updated_by: req_ticket.updated_by,
    updated_by_name: updated_user.name,
    remarks: req_ticket.remarks,
    req_ticket_item: sql`(
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT
          rti.uuid,
          rti.req_ticket_uuid,
          rti.item_uuid,
          it.name as item_name,
          rti.quantity::float8,
          rti.created_at,
          rti.created_by,
          rti.updated_at,
          rti.updated_by,
          rti.remarks
        FROM procure.req_ticket_item rti
        LEFT JOIN procure.item it ON rti.item_uuid = it.uuid
        WHERE rti.req_ticket_uuid = ${req_ticket.uuid}
      ) t
    )`,
  })
    .from(req_ticket)
    .leftJoin(hrSchema.users, eq(req_ticket.created_by, hrSchema.users.uuid))
    .leftJoin(updated_user, eq(req_ticket.updated_by, updated_user.uuid))
    .where(eq(req_ticket.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
