import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { constructSelectAllQuery } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { department, department_teachers, faculty } from '@/routes/portfolio/schema';

import type { ValueLabelRouteForPublication } from './routes';

export const valueLabelForPublication: AppRouteHandler<ValueLabelRouteForPublication> = async (c: any) => {
  const { latest, is_pagination } = c.req.valid('query');

  const resultPromise = db.select({
    value: department_teachers.publication,
    label: sql`CONCAT(users.name, ' - ', faculty.name)`,
  })
    .from(department_teachers)
    .leftJoin(hrSchema.users, eq(department_teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(department, eq(department_teachers.department_uuid, department.uuid))
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid));

  if (latest === 'true') {
    resultPromise.orderBy(sql`DATE(${department_teachers.created_at}) DESC`).limit(10);
  }

  const limit = Number.parseInt(c.req.valid('query').limit);
  const page = Number.parseInt(c.req.valid('query').page);
  const baseQuery = is_pagination === 'false'
    ? resultPromise
    : constructSelectAllQuery(resultPromise, c.req.valid('query'), 'created_at', [hrSchema.users.name.name, faculty.name.name]);

  const data = await baseQuery;

  const pagination = is_pagination === 'false'
    ? null
    : {
        total_record: data.length,
        current_page: Number(page),
        total_page: Math.ceil(data.length / limit),
        next_page: page + 1 > Math.ceil(data.length / limit) ? null : page + 1,
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
