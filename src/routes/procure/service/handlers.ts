import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { general_note, service, service_vendor, sub_category, vendor } from '../schema';

const sv_vendor = alias(vendor, 'sv_vendor');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(service).values(value).returning({
    name: service.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(service)
    .set(updates)
    .where(eq(service.uuid, uuid))
    .returning({
      name: service.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(service)
    .where(eq(service.uuid, uuid))
    .returning({
      name: service.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    index: service.index,
    uuid: service.uuid,
    sub_category_uuid: service.sub_category_uuid,
    sub_category_name: sub_category.name,
    sub_category_type: sub_category.type,
    name: service.name,
    is_quotation: service.is_quotation,
    is_cs: service.is_cs,
    cs_remarks: service.cs_remarks,
    is_monthly_meeting: service.is_monthly_meeting,
    monthly_meeting_remarks: service.monthly_meeting_remarks,
    is_work_order: service.is_work_order,
    work_order_remarks: service.work_order_remarks,
    is_delivery_statement: service.is_delivery_statement,
    delivery_statement_remarks: service.delivery_statement_remarks,
    done: service.done,
    created_at: service.created_at,
    updated_at: service.updated_at,
    created_by: service.created_by,
    created_by_name: hrSchema.users.name,
    remarks: service.remarks,

  })
    .from(service)
    .leftJoin(hrSchema.users, eq(service.created_by, hrSchema.users.uuid))
    .leftJoin(sub_category, eq(service.sub_category_uuid, sub_category.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    index: service.index,
    uuid: service.uuid,
    vendor_uuid: service.vendor_uuid,
    vendor_name: vendor.name,
    sub_category_uuid: service.sub_category_uuid,
    sub_category_name: sub_category.name,
    sub_category_type: sub_category.type,
    name: service.name,
    is_quotation: service.is_quotation,
    is_cs: service.is_cs,
    cs_remarks: service.cs_remarks,
    is_monthly_meeting: service.is_monthly_meeting,
    monthly_meeting_remarks: service.monthly_meeting_remarks,
    is_work_order: service.is_work_order,
    work_order_remarks: service.work_order_remarks,
    is_delivery_statement: service.is_delivery_statement,
    delivery_statement_remarks: service.delivery_statement_remarks,
    done: service.done,
    created_at: service.created_at,
    updated_at: service.updated_at,
    created_by: service.created_by,
    created_by_name: hrSchema.users.name,
    remarks: service.remarks,
    quotations: sql`
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
              'uuid', service_vendor.uuid,
              'service_uuid', service_vendor.service_uuid,
              'service_name', service.name,
              'vendor_uuid', service_vendor.vendor_uuid,
              'vendor_name', sv_vendor.name,
              'amount', service_vendor.amount,
              'is_selected', service_vendor.is_selected
            )
        ) FILTER (WHERE service_vendor.uuid IS NOT NULL),
      '[]'::jsonb      
    )`,
    general_notes: sql`
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
              'uuid', general_note.uuid,
              'service_uuid', general_note.service_uuid,
              'service_name', service.name,
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
    .from(service)
    .leftJoin(hrSchema.users, eq(service.created_by, hrSchema.users.uuid))
    .leftJoin(sub_category, eq(service.sub_category_uuid, sub_category.uuid))
    .leftJoin(service_vendor, eq(service_vendor.service_uuid, service.uuid))
    .leftJoin(vendor, eq(service.vendor_uuid, vendor.uuid))
    .leftJoin(sv_vendor, eq(service_vendor.vendor_uuid, sv_vendor.uuid))
    .leftJoin(general_note, eq(general_note.service_uuid, service.uuid))
    .where(eq(service.uuid, uuid))
    .groupBy(
      service.index,
      service.uuid,
      vendor.uuid,
      sub_category.index,
      sub_category.uuid,
      service.name,
      service.is_quotation,
      service.is_cs,
      service.cs_remarks,
      service.is_monthly_meeting,
      service.monthly_meeting_remarks,
      service.is_work_order,
      service.work_order_remarks,
      service.is_delivery_statement,
      service.delivery_statement_remarks,
      service.done,
      service.created_at,
      service.updated_at,
      service.created_by,
      hrSchema.users.name,
      service.remarks,
    );

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
