import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { department, department_teachers, faculty } from '@/routes/portfolio/schema';

import type { ValueLabelRouteForPublication } from './routes';

export const valueLabelForPublication: AppRouteHandler<ValueLabelRouteForPublication> = async (c: any) => {
  const resultPromise = db.select({
    value: sql`CONCAT(users.name, ' - ', faculty.name)`,
    label: department_teachers.publication,
  })
    .from(department_teachers)
    .leftJoin(hrSchema.users, eq(department_teachers.teacher_uuid, hrSchema.users.uuid))
    .leftJoin(department, eq(department_teachers.department_uuid, department.uuid))
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid));

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
