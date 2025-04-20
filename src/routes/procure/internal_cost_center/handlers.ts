import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { internal_cost_center } from '../schema';

const authorized_person = alias(hrSchema.users, 'authorized_person');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(internal_cost_center).values(value).returning({
    name: internal_cost_center.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(internal_cost_center)
    .set(updates)
    .where(eq(internal_cost_center.uuid, uuid))
    .returning({
      name: internal_cost_center.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(internal_cost_center)
    .where(eq(internal_cost_center.uuid, uuid))
    .returning({
      name: internal_cost_center.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { internal_cost_center } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: internal_cost_center.uuid,
    type: internal_cost_center.type,
    authorized_person_uuid: internal_cost_center.authorized_person_uuid,
    name: internal_cost_center.name,
    authorized_person_name: authorized_person.name,
    from: internal_cost_center.from,
    to: internal_cost_center.to,
    budget: PG_DECIMAL_TO_FLOAT(internal_cost_center.budget),
    created_at: internal_cost_center.created_at,
    updated_at: internal_cost_center.updated_at,
    created_by: internal_cost_center.created_by,
    created_by_name: hrSchema.users.name,
    remarks: internal_cost_center.remarks,
    can_submitted_person_uuid: internal_cost_center.can_submitted_person_uuid,

  })
    .from(internal_cost_center)
    .leftJoin(hrSchema.users, eq(internal_cost_center.created_by, hrSchema.users.uuid))
    .leftJoin(authorized_person, eq(internal_cost_center.authorized_person_uuid, authorized_person.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.internal_cost_center.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  // });

  const resultPromise = db.select({
    uuid: internal_cost_center.uuid,
    type: internal_cost_center.type,
    authorized_person_uuid: internal_cost_center.authorized_person_uuid,
    name: internal_cost_center.name,
    authorized_person_name: authorized_person.name,
    from: internal_cost_center.from,
    to: internal_cost_center.to,
    budget: PG_DECIMAL_TO_FLOAT(internal_cost_center.budget),
    created_at: internal_cost_center.created_at,
    updated_at: internal_cost_center.updated_at,
    created_by: internal_cost_center.created_by,
    created_by_name: hrSchema.users.name,
    remarks: internal_cost_center.remarks,
    can_submitted_person_uuid: internal_cost_center.can_submitted_person_uuid,

  })
    .from(internal_cost_center)
    .leftJoin(hrSchema.users, eq(internal_cost_center.created_by, hrSchema.users.uuid))
    .leftJoin(authorized_person, eq(internal_cost_center.authorized_person_uuid, authorized_person.uuid))
    .where(eq(internal_cost_center.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
