import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { course, course_section, sem_crs_thr_entry } from '@/routes/lib/schema';
import { teachers } from '@/routes/portfolio/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { semester_uuid } = c.req.valid('query');
  const resultPromise = db.select({
    value: sem_crs_thr_entry.uuid,
    label: sql`CONCAT( ${course.name}, ' - ',${course_section.name}, ' - ', ${users.name} , ' - ', ${sem_crs_thr_entry.class_size})`.as('label'),
  })
    .from(sem_crs_thr_entry)
    .leftJoin(course_section, eq(course_section.uuid, sem_crs_thr_entry.course_section_uuid))
    .leftJoin(course, eq(course.uuid, course_section.course_uuid))
    .leftJoin(teachers, eq(teachers.uuid, sem_crs_thr_entry.teachers_uuid))
    .leftJoin(users, eq(users.uuid, teachers.teacher_uuid));

  if (semester_uuid) {
    resultPromise.where(eq(sem_crs_thr_entry.semester_uuid, semester_uuid));
  }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
