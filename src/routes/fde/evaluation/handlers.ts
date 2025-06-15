import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { evaluation, qns } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(evaluation).values(value).returning({
    name: evaluation.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(evaluation)
    .set(updates)
    .where(eq(evaluation.uuid, uuid))
    .returning({
      name: evaluation.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(evaluation)
    .where(eq(evaluation.uuid, uuid))
    .returning({
      name: evaluation.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.evaluation.findMany();
  const resultPromise = db.select({
    uuid: evaluation.uuid,
    respond_student_uuid: evaluation.respond_student_uuid,
    qns_uuid: evaluation.qns_uuid,
    qns_name: qns.name,
    rating: evaluation.rating,
    created_by: evaluation.created_by,
    created_by_name: users.name,
    created_at: evaluation.created_at,
    updated_at: evaluation.updated_at,
    remarks: evaluation.remarks,
  })
    .from(evaluation)
    .leftJoin(qns, eq(qns.uuid, evaluation.qns_uuid))
    .leftJoin(users, eq(users.uuid, evaluation.created_by));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.select({
    uuid: evaluation.uuid,
    respond_student_uuid: evaluation.respond_student_uuid,
    qns_uuid: evaluation.qns_uuid,
    qns_name: qns.name,
    rating: evaluation.rating,
    created_by: evaluation.created_by,
    created_by_name: users.name,
    created_at: evaluation.created_at,
    updated_at: evaluation.updated_at,
    remarks: evaluation.remarks,
  })
    .from(evaluation)
    .leftJoin(qns, eq(qns.uuid, evaluation.qns_uuid))
    .leftJoin(users, eq(users.uuid, evaluation.created_by))
    .where(eq(evaluation.uuid, uuid));

  if (!data)
    return DataNotFound(c);

  return c.json(data, HSCode.OK);
};
