import type { AppRouteHandler } from '@/lib/types';

import { and, eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { constructSelectAllQuery } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { room_allocation, sem_crs_thr_entry } from '@/routes/lib/schema';
import { department, department_teachers, faculty, teachers } from '@/routes/portfolio/schema';

import type { ValueLabelRoute, ValueLabelRouteForPublication } from './routes';

export const valueLabelForPublication: AppRouteHandler<ValueLabelRouteForPublication> = async (c: any) => {
  const { is_pagination, field_name, field_value, filter } = c.req.valid('query');

  const resultPromise = db.select({
    label: sql`DISTINCT CONCAT(users.name, CASE WHEN faculty.name IS NOT NULL THEN ' - ' ELSE '' END, faculty.name)`,
    value: teachers.publication,
  })
    .from(teachers)
    .leftJoin(hrSchema.users, eq(teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(department_teachers, eq(teachers.uuid, department_teachers.teachers_uuid))
    .leftJoin(department, eq(department_teachers.department_uuid, department.uuid))
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid));

  if (filter) {
    resultPromise.where(
      sql`lower(${faculty.name}) LIKE lower(${`%${filter}%`})`,
    );
  }

  const resultPromiseForCount = await resultPromise;

  const limit = Number.parseInt(c.req.valid('query').limit);
  const page = Number.parseInt(c.req.valid('query').page);
  const baseQuery = is_pagination === 'false'
    ? resultPromise
    : constructSelectAllQuery(resultPromise, c.req.valid('query'), 'created_at', [hrSchema.users.name.name, faculty.name.name], field_name, field_value);

  const data = await baseQuery;

  const pagination = is_pagination === 'false'
    ? null
    : {
        total_record: resultPromiseForCount.length,
        current_page: Number(page),
        total_page: Math.ceil(resultPromiseForCount.length / limit),
        next_page: page + 1 > Math.ceil(resultPromiseForCount.length / limit) ? null : page + 1,
        prev_page: page - 1 <= 0 ? null : page - 1,
      };

  const response = is_pagination === 'false'
    ? data
    : {
        data,
        pagination,
      };

  return c.json(response, HSCode.OK);
};

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { department_uuid, semester_uuid, is_room_allocation } = c.req.valid('query');
  const resultPromise = db.selectDistinct({
    value: teachers.uuid,
    label: sql`CONCAT(users.name, CASE WHEN teachers.teacher_email IS NOT NULL THEN ' - ' ELSE '' END, teachers.teacher_email)`,
  })
    .from(teachers)
    .leftJoin(hrSchema.users, eq(teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(department_teachers, eq(teachers.uuid, department_teachers.teachers_uuid))
    .leftJoin(department, eq(department_teachers.department_uuid, department.uuid))
    .leftJoin(sem_crs_thr_entry, eq(sem_crs_thr_entry.teachers_uuid, teachers.uuid))
    .leftJoin(room_allocation, eq(room_allocation.sem_crs_thr_entry_uuid, sem_crs_thr_entry.uuid));

  const filters = [];

  if (department_uuid)
    filters.push(eq(department_teachers.department_uuid, department_uuid));

  if (semester_uuid)
    filters.push(eq(sem_crs_thr_entry.semester_uuid, semester_uuid));

  if (is_room_allocation === 'true') {
    filters.push(sql`${room_allocation.uuid} IS NOT NULL`);
  }

  if (filters.length > 0) {
    resultPromise.where(and(...filters));
  }

  // if (department_uuid) {
  //   resultPromise.where(eq(department.uuid, department_uuid));
  // }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
