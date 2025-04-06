import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneDetailsRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { service, sub_category, vendor } from '../schema';

// const sv_vendor = alias(vendor, 'sv_vendor');

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
    id: service.id,
    uuid: service.uuid,
    sub_category_uuid: service.sub_category_uuid,
    sub_category_name: sub_category.name,
    sub_category_type: sub_category.type,
    vendor_uuid: service.vendor_uuid,
    vendor_name: vendor.name,
    name: service.name,
    description: service.description,
    frequency: service.frequency,
    start_date: service.start_date,
    end_date: service.end_date,
    next_due_date: service.next_due_date,
    cost_per_service: service.cost_per_service,
    payment_terms: service.payment_terms,
    status: service.status,
    approval_required: service.approval_required,
    created_at: service.created_at,
    updated_at: service.updated_at,
    created_by: service.created_by,
    created_by_name: hrSchema.users.name,
    remarks: service.remarks,

  })
    .from(service)
    .leftJoin(hrSchema.users, eq(service.created_by, hrSchema.users.uuid))
    .leftJoin(sub_category, eq(service.sub_category_uuid, sub_category.uuid))
    .leftJoin(vendor, eq(service.vendor_uuid, vendor.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: service.id,
    uuid: service.uuid,
    sub_category_uuid: service.sub_category_uuid,
    sub_category_name: sub_category.name,
    sub_category_type: sub_category.type,
    vendor_uuid: service.vendor_uuid,
    vendor_name: vendor.name,
    name: service.name,
    description: service.description,
    frequency: service.frequency,
    start_date: service.start_date,
    end_date: service.end_date,
    next_due_date: service.next_due_date,
    cost_per_service: service.cost_per_service,
    payment_terms: service.payment_terms,
    status: service.status,
    approval_required: service.approval_required,
    created_at: service.created_at,
    updated_at: service.updated_at,
    created_by: service.created_by,
    created_by_name: hrSchema.users.name,
    remarks: service.remarks,
  })
    .from(service)
    .leftJoin(hrSchema.users, eq(service.created_by, hrSchema.users.uuid))
    .leftJoin(sub_category, eq(service.sub_category_uuid, sub_category.uuid))
    .leftJoin(vendor, eq(service.vendor_uuid, vendor.uuid))
    .where(eq(service.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};

export const getOneDetails: AppRouteHandler<GetOneDetailsRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.service.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
    with: {
      service_payment: {
        columns: {
          uuid: true,
          amount: true,
          payment_date: true,
          created_by: true,
          created_at: true,
          updated_at: true,
          remarks: true,
        },
        orderBy: (service_payment, { asc }) => [asc(service_payment.created_at)],
      },
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
