import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { capital, capital_vendor, general_note, sub_category, vendor } from '../schema';

const sv_vendor = alias(vendor, 'sv_vendor');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(capital).values(value).returning({
    name: capital.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(capital)
    .set(updates)
    .where(eq(capital.uuid, uuid))
    .returning({
      name: capital.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(capital)
    .where(eq(capital.uuid, uuid))
    .returning({
      name: capital.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    index: capital.index,
    uuid: capital.uuid,
    sub_category_uuid: capital.sub_category_uuid,
    sub_category_name: sub_category.name,
    sub_category_type: sub_category.type,
    name: capital.name,
    is_quotation: capital.is_quotation,
    is_cs: capital.is_cs,
    cs_remarks: capital.cs_remarks,
    is_monthly_meeting: capital.is_monthly_meeting,
    monthly_meeting_remarks: capital.monthly_meeting_remarks,
    is_work_order: capital.is_work_order,
    work_order_remarks: capital.work_order_remarks,
    is_delivery_statement: capital.is_delivery_statement,
    delivery_statement_remarks: capital.delivery_statement_remarks,
    done: capital.done,
    created_at: capital.created_at,
    updated_at: capital.updated_at,
    created_by: capital.created_by,
    created_by_name: hrSchema.users.name,
    remarks: capital.remarks,

  })
    .from(capital)
    .leftJoin(hrSchema.users, eq(capital.created_by, hrSchema.users.uuid))
    .leftJoin(sub_category, eq(capital.sub_category_uuid, sub_category.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    index: capital.index,
    uuid: capital.uuid,
    vendor_uuid: capital.vendor_uuid,
    vendor_name: vendor.name,
    sub_category_uuid: capital.sub_category_uuid,
    sub_category_name: sub_category.name,
    sub_category_type: sub_category.type,
    name: capital.name,
    is_quotation: capital.is_quotation,
    is_cs: capital.is_cs,
    cs_remarks: capital.cs_remarks,
    is_monthly_meeting: capital.is_monthly_meeting,
    monthly_meeting_remarks: capital.monthly_meeting_remarks,
    is_work_order: capital.is_work_order,
    work_order_remarks: capital.work_order_remarks,
    is_delivery_statement: capital.is_delivery_statement,
    delivery_statement_remarks: capital.delivery_statement_remarks,
    done: capital.done,
    created_at: capital.created_at,
    updated_at: capital.updated_at,
    created_by: capital.created_by,
    created_by_name: hrSchema.users.name,
    remarks: capital.remarks,
    quotations: sql`
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
              'uuid', capital_vendor.uuid,
              'capital_uuid', capital_vendor.capital_uuid,
              'capital_name', capital.name,
              'vendor_uuid', capital_vendor.vendor_uuid,
              'vendor_name', sv_vendor.name,
              'amount', capital_vendor.amount,
              'is_selected', capital_vendor.is_selected
            )
        ) FILTER (WHERE capital_vendor.uuid IS NOT NULL),
      '[]'::jsonb      
    )`,
    general_notes: sql`
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
              'uuid', general_note.uuid,
              'capital_uuid', general_note.capital_uuid,
              'capital_name', capital.name,
              'description', general_note.description,
              'amount', general_note.amount,
              'created_at', general_note.created_at,
              'updated_at', general_note.updated_at
            )
        ) FILTER (WHERE general_note.uuid IS NOT NULL),
        '[]'::jsonb      
        )
      `,
  })
    .from(capital)
    .leftJoin(hrSchema.users, eq(capital.created_by, hrSchema.users.uuid))
    .leftJoin(sub_category, eq(capital.sub_category_uuid, sub_category.uuid))
    .leftJoin(capital_vendor, eq(capital_vendor.capital_uuid, capital.uuid))
    .leftJoin(vendor, eq(capital.vendor_uuid, vendor.uuid))
    .leftJoin(sv_vendor, eq(capital_vendor.vendor_uuid, sv_vendor.uuid))
    .leftJoin(general_note, eq(general_note.capital_uuid, capital.uuid))
    .where(eq(capital.uuid, uuid))
    .groupBy(
      capital.index,
      capital.uuid,
      vendor.uuid,
      sub_category.index,
      sub_category.uuid,
      capital.name,
      capital.is_quotation,
      capital.is_cs,
      capital.cs_remarks,
      capital.is_monthly_meeting,
      capital.monthly_meeting_remarks,
      capital.is_work_order,
      capital.work_order_remarks,
      capital.is_delivery_statement,
      capital.delivery_statement_remarks,
      capital.done,
      capital.created_at,
      capital.updated_at,
      capital.created_by,
      hrSchema.users.name,
      capital.remarks,
    );

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
