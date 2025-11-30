import type { AppRouteHandler } from '@/lib/types';

import { and, eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { online_admission, program } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(online_admission).values(value).returning({
    uuid: online_admission.uuid,
  });

  return c.json(createToast('create', data.uuid ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(online_admission)
    .set(updates)
    .where(eq(online_admission.uuid, uuid))
    .returning({
      uuid: online_admission.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.uuid ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(online_admission)
    .where(eq(online_admission.uuid, uuid))
    .returning({
      uuid: online_admission.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.uuid ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.online_admission.findMany();

  const { date } = c.req.valid('query');

  console.log('date', date);

  const resultPromise = db.select({
    id: online_admission.id,
    uuid: online_admission.uuid,
    semester: online_admission.semester,
    program_uuid: online_admission.program_uuid,
    program_name: program.name,
    applicant_name: online_admission.applicant_name,
    father_name: online_admission.father_name,
    mother_name: online_admission.mother_name,
    local_guardian: online_admission.local_guardian,
    date_of_birth: online_admission.date_of_birth,
    nationality: online_admission.nationality,
    blood_group: online_admission.blood_group,
    phone_number: online_admission.phone_number,
    email: online_admission.email,
    gender: online_admission.gender,
    marital_status: online_admission.marital_status,
    present_address: online_admission.present_address,
    village: online_admission.village,
    post_office: online_admission.post_office,
    thana: online_admission.thana,
    district: online_admission.district,
    ssc_group: online_admission.ssc_group,
    ssc_grade: online_admission.ssc_grade,
    ssc_gpa: PG_DECIMAL_TO_FLOAT(online_admission.ssc_gpa),
    ssc_board: online_admission.ssc_board,
    ssc_passing_year: online_admission.ssc_passing_year,
    ssc_institute: online_admission.ssc_institute,
    hsc_group: online_admission.hsc_group,
    hsc_grade: online_admission.hsc_grade,
    hsc_gpa: PG_DECIMAL_TO_FLOAT(online_admission.hsc_gpa),
    hsc_board: online_admission.hsc_board,
    hsc_passing_year: online_admission.hsc_passing_year,
    hsc_institute: online_admission.hsc_institute,
    bsc_name: online_admission.bsc_name,
    bsc_cgpa: PG_DECIMAL_TO_FLOAT(online_admission.bsc_cgpa),
    bsc_passing_year: online_admission.bsc_passing_year,
    bsc_institute: online_admission.bsc_institute,
    created_at: online_admission.created_at,
    updated_at: online_admission.updated_at,
    created_by: online_admission.created_by,
    created_by_name: hrSchema.users.name,
    remarks: online_admission.remarks,
    bkash: online_admission.bkash,
    birth_certificate_number: sql`CASE WHEN ${online_admission.birth_certificate_number} IS NOT NULL THEN ${online_admission.birth_certificate_number} ELSE '' END`,
    nid_number: online_admission.nid_number,
    hsc_roll_number: online_admission.hsc_roll_number,
    hsc_registration_number: online_admission.hsc_registration_number,
    ssc_roll_number: online_admission.ssc_roll_number,
    ssc_registration_number: online_admission.ssc_registration_number,
    year: online_admission.year,
    religion: online_admission.religion,
    local_guardian_phone: online_admission.local_guardian_phone,
    parents_phone: online_admission.parents_phone,
    student_id: sql`CASE WHEN ${online_admission.student_id} IS NOT NULL THEN ${online_admission.student_id} ELSE '' END`,
    is_admitted: online_admission.is_admitted,
    commencement_date: online_admission.commencement_date,
    tuition_fee: PG_DECIMAL_TO_FLOAT(online_admission.tuition_fee),
    admission_fee: PG_DECIMAL_TO_FLOAT(online_admission.admission_fee),
    others_fee: PG_DECIMAL_TO_FLOAT(online_admission.others_fee),
    paid_amount: PG_DECIMAL_TO_FLOAT(online_admission.paid_amount),
    reference_name: online_admission.reference_name,
    reference_phone: online_admission.reference_phone,
    internal_id: online_admission.internal_id,
  })
    .from(online_admission)
    .leftJoin(program, eq(online_admission.program_uuid, program.uuid))
    .leftJoin(hrSchema.users, eq(online_admission.created_by, hrSchema.users.uuid));

  const filters = [];

  if (date) {
    filters.push(eq(sql`${online_admission.created_at}::date`, sql`${date}::date`));
  }

  if (filters.length > 0) {
    resultPromise.where(and(...filters));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.online_admission.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  // });

  const resultPromise = db.select({
    id: online_admission.id,
    uuid: online_admission.uuid,
    semester: online_admission.semester,
    program_uuid: online_admission.program_uuid,
    program_name: program.name,
    applicant_name: online_admission.applicant_name,
    father_name: online_admission.father_name,
    mother_name: online_admission.mother_name,
    local_guardian: online_admission.local_guardian,
    date_of_birth: online_admission.date_of_birth,
    nationality: online_admission.nationality,
    blood_group: online_admission.blood_group,
    phone_number: online_admission.phone_number,
    email: online_admission.email,
    gender: online_admission.gender,
    marital_status: online_admission.marital_status,
    present_address: online_admission.present_address,
    village: online_admission.village,
    post_office: online_admission.post_office,
    thana: online_admission.thana,
    district: online_admission.district,
    ssc_group: online_admission.ssc_group,
    ssc_grade: online_admission.ssc_grade,
    ssc_gpa: PG_DECIMAL_TO_FLOAT(online_admission.ssc_gpa),
    ssc_board: online_admission.ssc_board,
    ssc_passing_year: online_admission.ssc_passing_year,
    ssc_institute: online_admission.ssc_institute,
    hsc_group: online_admission.hsc_group,
    hsc_grade: online_admission.hsc_grade,
    hsc_gpa: PG_DECIMAL_TO_FLOAT(online_admission.hsc_gpa),
    hsc_board: online_admission.hsc_board,
    hsc_passing_year: online_admission.hsc_passing_year,
    hsc_institute: online_admission.hsc_institute,
    bsc_name: online_admission.bsc_name,
    bsc_cgpa: PG_DECIMAL_TO_FLOAT(online_admission.bsc_cgpa),
    bsc_passing_year: online_admission.bsc_passing_year,
    bsc_institute: online_admission.bsc_institute,
    created_at: online_admission.created_at,
    updated_at: online_admission.updated_at,
    created_by: online_admission.created_by,
    created_by_name: hrSchema.users.name,
    remarks: online_admission.remarks,
    spring: sql`CASE WHEN ${online_admission.semester} = 'spring' THEN true ELSE false END`,
    summer: sql`CASE WHEN ${online_admission.semester} = 'summer' THEN true ELSE false END`,
    fall: sql`CASE WHEN ${online_admission.semester} = 'fall' THEN true ELSE false END`,
    bkash: online_admission.bkash,
    birth_certificate_number: sql`CASE WHEN ${online_admission.birth_certificate_number} IS NOT NULL THEN ${online_admission.birth_certificate_number} ELSE '' END`,
    nid_number: online_admission.nid_number,
    hsc_roll_number: online_admission.hsc_roll_number,
    hsc_registration_number: online_admission.hsc_registration_number,
    ssc_roll_number: online_admission.ssc_roll_number,
    ssc_registration_number: online_admission.ssc_registration_number,
    year: online_admission.year,
    religion: online_admission.religion,
    local_guardian_phone: online_admission.local_guardian_phone,
    parents_phone: online_admission.parents_phone,
    student_id: sql`CASE WHEN ${online_admission.student_id} IS NOT NULL THEN ${online_admission.student_id} ELSE '' END`,
    is_admitted: online_admission.is_admitted,
    commencement_date: online_admission.commencement_date,
    tuition_fee: PG_DECIMAL_TO_FLOAT(online_admission.tuition_fee),
    admission_fee: PG_DECIMAL_TO_FLOAT(online_admission.admission_fee),
    others_fee: PG_DECIMAL_TO_FLOAT(online_admission.others_fee),
    paid_amount: PG_DECIMAL_TO_FLOAT(online_admission.paid_amount),
    reference_name: online_admission.reference_name,
    reference_phone: online_admission.reference_phone,
    internal_id: online_admission.internal_id,
  })
    .from(online_admission)
    .leftJoin(program, eq(online_admission.program_uuid, program.uuid))
    .leftJoin(hrSchema.users, eq(online_admission.created_by, hrSchema.users.uuid))
    .where(eq(online_admission.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
