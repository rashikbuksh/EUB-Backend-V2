import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { certificate_course_fee, program } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(certificate_course_fee).values(value).returning({
    uuid: certificate_course_fee.uuid,
  });

  return c.json(createToast('create', data.uuid ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(certificate_course_fee)
    .set(updates)
    .where(eq(certificate_course_fee.uuid, uuid))
    .returning({
      uuid: certificate_course_fee.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.uuid ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(certificate_course_fee)
    .where(eq(certificate_course_fee.uuid, uuid))
    .returning({
      uuid: certificate_course_fee.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.uuid ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.certificate_course_fee.findMany();

  const resultPromise = db.select({
    uuid: certificate_course_fee.uuid,
    program_uuid: certificate_course_fee.programs_uuid,
    program_name: program.name,
    fee_per_course: certificate_course_fee.fee_per_course,
    created_at: certificate_course_fee.created_at,
    updated_at: certificate_course_fee.updated_at,
    created_by: certificate_course_fee.created_by,
    remarks: certificate_course_fee.remarks,
  }).from(certificate_course_fee).leftJoin(program, eq(certificate_course_fee.programs_uuid, program.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.certificate_course_fee.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
