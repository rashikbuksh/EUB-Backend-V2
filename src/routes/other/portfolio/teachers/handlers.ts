import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { constructSelectAllQuery } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { department, faculty, teachers } from '@/routes/portfolio/schema';

import type { ValueLabelRouteForPublication } from './routes';

export const valueLabelForPublication: AppRouteHandler<ValueLabelRouteForPublication> = async (c: any) => {
  const { is_pagination, field_name, field_value } = c.req.valid('query');

  const resultPromise = db.select({
    value: teachers.publication,
    label: sql`CONCAT(users.name, ' - ', faculty.name)`,
  })
    .from(teachers)
    .leftJoin(hrSchema.users, eq(teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid));

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
