import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetItemRequisitionDetailsByRequisitionUuidRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { internal_cost_center, requisition } from '../schema';

// const authorized_person = alias(hrSchema.users, 'authorized_person');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(requisition).values(value).returning({
    name: requisition.department,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(requisition)
    .set(updates)
    .where(eq(requisition.uuid, uuid))
    .returning({
      name: requisition.department,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(requisition)
    .where(eq(requisition.uuid, uuid))
    .returning({
      name: requisition.department,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { user_uuid } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: requisition.uuid,
    id: requisition.id,
    internal_cost_center_uuid: requisition.internal_cost_center_uuid,
    internal_cost_center_name: internal_cost_center.name,
    is_received: requisition.is_received,
    received_date: requisition.received_date,
    department: requisition.department,
    created_at: requisition.created_at,
    updated_at: requisition.updated_at,
    created_by: requisition.created_by,
    created_by_name: hrSchema.users.name,
    remarks: requisition.remarks,

  })
    .from(requisition)
    .leftJoin(hrSchema.users, eq(requisition.created_by, hrSchema.users.uuid))
    .leftJoin(internal_cost_center, eq(requisition.internal_cost_center_uuid, internal_cost_center.uuid));

  if (user_uuid) {
    resultPromise.where(eq(requisition.created_by, user_uuid));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.requisition.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};

export const getItemRequisitionDetailsByRequisitionUuid: AppRouteHandler<GetItemRequisitionDetailsByRequisitionUuidRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select(
    {
      uuid: requisition.uuid,
      id: requisition.id,
      internal_cost_center_uuid: requisition.internal_cost_center_uuid,
      internal_cost_center_name: internal_cost_center.name,
      is_received: requisition.is_received,
      received_date: requisition.received_date,
      department: requisition.department,
      created_at: requisition.created_at,
      updated_at: requisition.updated_at,
      created_by: requisition.created_by,
      created_by_name: hrSchema.users.name,
      remarks: requisition.remarks,
      item_requisition: sql`COALESCE(ARRAY(SELECT json_build_object(
        'uuid', item_requisition.uuid,
        'item_uuid', item_requisition.item_uuid,
        'item_name', item.name,
        'requisition_uuid', item_requisition.requisition_uuid,
        'requisition_department', requisition.department,
        'req_quantity', item_requisition.req_quantity::float8,
        'provided_quantity', item_requisition.provided_quantity::float8,
        'created_by', item_requisition.created_by,
        'created_by_name', hr.users.name,
        'created_at', item_requisition.created_at,
        'updated_at', item_requisition.updated_at,
        'remarks', item_requisition.remarks
      ) 
      FROM procure.item_requisition
      LEFT JOIN hr.users ON item_requisition.created_by = hr.users.uuid
      LEFT JOIN procure.item ON item_requisition.item_uuid = item.uuid
      WHERE item_requisition.requisition_uuid = ${requisition.uuid}
      ORDER BY item_requisition.created_at DESC), '{}')`,
    },
  )
    .from(requisition)
    .leftJoin(hrSchema.users, eq(requisition.created_by, hrSchema.users.uuid))
    .leftJoin(internal_cost_center, eq(requisition.internal_cost_center_uuid, internal_cost_center.uuid))
    .where(eq(requisition.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
