import type { AppRouteHandler } from '@/lib/types';

import { and, eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { room_allocation, sem_crs_thr_entry } from '@/routes/lib/schema';
import { department, department_teachers, teachers } from '@/routes/portfolio/schema';

import type { ValueLabelRoute, ValueLabelRouteForPublication } from './routes';

export const valueLabelForPublication: AppRouteHandler<ValueLabelRouteForPublication> = async (c: any) => {
  const { is_pagination, q, filter } = c.req.valid('query');

  let query = sql`
    SELECT DISTINCT
      CONCAT(u.name, CASE WHEN f.name IS NOT NULL THEN ' - ' ELSE '' END, f.name) AS label,
      t.publication AS value,
      d.index as department_index,
      dt.index as department_teacher_index
    FROM portfolio.teachers t
    LEFT JOIN hr.users u ON t.teacher_uuid = u.uuid
    LEFT JOIN portfolio.department_teachers dt ON t.uuid = dt.teachers_uuid
    LEFT JOIN portfolio.department d ON dt.department_uuid = d.uuid
    LEFT JOIN portfolio.faculty f ON d.faculty_uuid = f.uuid
    WHERE 1=1
  `;

  if (q) {
    query = sql`${query} AND LOWER(u.name) LIKE LOWER(${`%${q}%`})`;
  }

  if (filter && filter.trim() !== '' && filter !== 'all' && filter !== 'null') {
    query = sql`${query} AND LOWER(f.name) = LOWER(${filter})`;
  }

  query = sql`${query} ORDER BY d.index, dt.index ASC`;

  // Get total count
  const countQuery = sql`SELECT COUNT(*) as count FROM (${query}) as subquery`;
  const countResult = await db.execute(countQuery);
  const totalRecord = Number(countResult.rows[0].count);

  // Add pagination
  if (is_pagination !== 'false' && is_pagination !== null && is_pagination !== undefined && is_pagination !== '') {
    const limit = Number.parseInt(c.req.valid('query').limit) || 10;
    const page = Number.parseInt(c.req.valid('query').page) || 1;
    const offset = (page - 1) * limit;

    query = sql`${query} LIMIT ${limit} OFFSET ${offset}`;
  }

  const result = await db.execute(query);
  const data = result.rows;

  const pagination = is_pagination === 'false'
    ? null
    : (() => {
        const limit = Number.parseInt(c.req.valid('query').limit) || 10;
        const page = Number.parseInt(c.req.valid('query').page) || 1;
        const totalPages = Math.ceil(totalRecord / limit);

        return {
          total_record: totalRecord,
          current_page: page,
          total_page: totalPages,
          next_page: page + 1 > totalPages ? null : page + 1,
          prev_page: page - 1 <= 0 ? null : page - 1,
        };
      })();

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
