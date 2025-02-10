import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { program, tuition_fee } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(tuition_fee).values(value).returning({
    uuid: tuition_fee.uuid,
  });

  return c.json(createToast('create', data.uuid ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(tuition_fee)
    .set(updates)
    .where(eq(tuition_fee.uuid, uuid))
    .returning({
      uuid: tuition_fee.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.uuid ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(tuition_fee)
    .where(eq(tuition_fee.uuid, uuid))
    .returning({
      uuid: tuition_fee.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.uuid ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.tuition_fee.findMany();
  const { category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: tuition_fee.uuid,
    title: tuition_fee.title,
    program_uuid: tuition_fee.program_uuid,
    program_name: program.name,
    category: program.category,
    admission_fee: PG_DECIMAL_TO_FLOAT(tuition_fee.admission_fee),
    tuition_fee_per_credit: PG_DECIMAL_TO_FLOAT(tuition_fee.tuition_fee_per_credit),
    student_activity_fee: PG_DECIMAL_TO_FLOAT(tuition_fee.student_activity_fee),
    library_fee_per_semester: PG_DECIMAL_TO_FLOAT(tuition_fee.library_fee_per_semester),
    computer_lab_fee_per_semester: PG_DECIMAL_TO_FLOAT(tuition_fee.computer_lab_fee_per_semester),
    science_lab_fee_per_semester: PG_DECIMAL_TO_FLOAT(tuition_fee.science_lab_fee_per_semester),
    studio_lab_fee: PG_DECIMAL_TO_FLOAT(tuition_fee.studio_lab_fee),
    created_at: tuition_fee.created_at,
    updated_at: tuition_fee.updated_at,
    created_by: tuition_fee.created_by,
    created_by_name: hrSchema.users.name,
    remarks: tuition_fee.remarks,
  })
    .from(tuition_fee)
    .leftJoin(program, eq(tuition_fee.program_uuid, program.uuid))
    .leftJoin(hrSchema.users, eq(tuition_fee.created_by, hrSchema.users.uuid));

  if (category)
    resultPromise.where(eq(program.category, category));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: tuition_fee.uuid,
    title: tuition_fee.title,
    program_uuid: tuition_fee.program_uuid,
    program_name: program.name,
    category: program.category,
    admission_fee: PG_DECIMAL_TO_FLOAT(tuition_fee.admission_fee),
    tuition_fee_per_credit: PG_DECIMAL_TO_FLOAT(tuition_fee.tuition_fee_per_credit),
    student_activity_fee: PG_DECIMAL_TO_FLOAT(tuition_fee.student_activity_fee),
    library_fee_per_semester: PG_DECIMAL_TO_FLOAT(tuition_fee.library_fee_per_semester),
    computer_lab_fee_per_semester: PG_DECIMAL_TO_FLOAT(tuition_fee.computer_lab_fee_per_semester),
    science_lab_fee_per_semester: PG_DECIMAL_TO_FLOAT(tuition_fee.science_lab_fee_per_semester),
    studio_lab_fee: PG_DECIMAL_TO_FLOAT(tuition_fee.studio_lab_fee),
    created_at: tuition_fee.created_at,
    updated_at: tuition_fee.updated_at,
    created_by: tuition_fee.created_by,
    created_by_name: hrSchema.users.name,
    remarks: tuition_fee.remarks,
  })
    .from(tuition_fee)
    .leftJoin(program, eq(tuition_fee.program_uuid, program.uuid))
    .leftJoin(hrSchema.users, eq(tuition_fee.created_by, hrSchema.users.uuid))
    .where(eq(tuition_fee.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
