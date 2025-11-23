import type { AppRouteHandler } from '@/lib/types';

import { and, desc, eq, sql } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { generateDynamicId } from '@/lib/dynamic_id';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetItemRequisitionDetailsByRequisitionUuidRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { internal_cost_center, requisition } from '../schema';

// const authorized_person = alias(hrSchema.users, 'authorized_person');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const newId = await generateDynamicId(requisition, requisition.id, requisition.created_at);

  const [data] = await db.insert(requisition).values({
    id: newId,
    ...value,
  }).returning({
    name: requisition.uuid,
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
      name: requisition.uuid,
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
      name: requisition.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { user_uuid, status, store_type } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: requisition.uuid,
    id: requisition.id,
    requisition_id: sql`CONCAT('RI', TO_CHAR(${requisition.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${requisition.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${requisition.id}, 'FM0000'))`,
    is_received: requisition.is_received,
    received_date: requisition.received_date,
    created_at: requisition.created_at,
    updated_at: requisition.updated_at,
    created_by: requisition.created_by,
    created_by_name: hrSchema.users.name,
    remarks: requisition.remarks,
    is_store_received: requisition.is_store_received,
    store_received_date: requisition.store_received_date,
    pi_generated_number: requisition.pi_generated_number,
    store_type: sql`COALESCE((
                              SELECT json_agg(DISTINCT item.store)::jsonb
                              FROM procure.item
                              LEFT JOIN procure.item_requisition ON item_requisition.item_uuid = item.uuid
                              WHERE item_requisition.requisition_uuid = ${requisition.uuid}
                            ), '[]'::jsonb)`,
  })
    .from(requisition)
    .leftJoin(hrSchema.users, eq(requisition.created_by, hrSchema.users.uuid))
    .orderBy(desc(requisition.created_at), desc(requisition.id));

  const filters = [];

  if (user_uuid) {
    filters.push(eq(requisition.created_by, user_uuid));
  }

  if (status) {
    if (status === 'pending') {
      filters.push(eq(requisition.is_received, false));
    }
    else if (status === 'completed') {
      filters.push(eq(requisition.is_received, true));
    }
    else if (status === 'store_not_received') {
      filters.push(
        eq(requisition.is_store_received, false),
      );
    }
  }
  if (store_type) {
    filters.push(sql`${store_type} = ANY (
                              SELECT DISTINCT item.store
                              FROM procure.item
                              LEFT JOIN procure.item_requisition ON item_requisition.item_uuid = item.uuid
                              WHERE item_requisition.requisition_uuid = ${requisition.uuid}
                            )`);
  }

  if (filters.length > 0) {
    resultPromise.where(and(...filters));
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
      requisition_id: sql`CONCAT('RI', TO_CHAR(${requisition.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${requisition.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${requisition.id}, 'FM0000'))`,
      is_received: requisition.is_received,
      received_date: requisition.received_date,
      created_at: requisition.created_at,
      updated_at: requisition.updated_at,
      created_by: requisition.created_by,
      created_by_name: hrSchema.users.name,
      remarks: requisition.remarks,
      is_store_received: requisition.is_store_received,
      store_received_date: requisition.store_received_date,
      pi_generated_number: requisition.pi_generated_number,
      department: internal_cost_center.department,
      designation: hrSchema.designation.name,
      item_requisition: sql`COALESCE(ARRAY(SELECT json_build_object(
        'uuid', item_requisition.uuid,
        'item_uuid', item_requisition.item_uuid,
        'item_name', item.name,
        'requisition_uuid', item_requisition.requisition_uuid,
        'stock_quantity', item.quantity::float8,
        'req_quantity', item_requisition.req_quantity::float8,
        'provided_quantity', item_requisition.provided_quantity::float8,
        'prev_provided_date', COALESCE((prev_ir.received_date), NULL),
        'prev_provided_quantity', COALESCE((prev_ir.provided_quantity::float8), 0),
        'created_by', item_requisition.created_by,
        'created_by_name', hr.users.name,
        'created_at', item_requisition.created_at,
        'updated_at', item_requisition.updated_at,
        'remarks', item_requisition.remarks,
        'index', item_requisition.index
      ) 
      FROM procure.item_requisition
      LEFT JOIN hr.users ON item_requisition.created_by = hr.users.uuid
      LEFT JOIN procure.item ON item_requisition.item_uuid = item.uuid
       LEFT JOIN LATERAL (
                          SELECT
                            ir.provided_quantity,
                            ir.requisition_uuid,
                            r.received_date,
                            ir.item_uuid
                          FROM procure.item_requisition ir
                          LEFT JOIN procure.requisition r ON ir.requisition_uuid = r.uuid
                          WHERE ir.requisition_uuid != ${requisition.uuid}
                            AND ir.provided_quantity::float8 > 0
                            AND r.created_by = ${requisition.created_by}
                            AND ir.created_by = ${requisition.created_by}
                            AND r.is_received = true
                            AND r.received_date <= ${requisition.created_at}
                            AND ir.item_uuid = item_requisition.item_uuid 
                          ORDER BY r.received_date DESC
                          LIMIT 1
                        ) AS prev_ir ON TRUE
      WHERE item_requisition.requisition_uuid = ${requisition.uuid}
      ORDER BY item_requisition.index ASC), '{}')`,
    },
  )
    .from(requisition)
    .leftJoin(hrSchema.users, eq(requisition.created_by, hrSchema.users.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid))
    .leftJoin(internal_cost_center, eq(internal_cost_center.can_submitted_person_uuid, requisition.created_by))
    .where(eq(requisition.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
