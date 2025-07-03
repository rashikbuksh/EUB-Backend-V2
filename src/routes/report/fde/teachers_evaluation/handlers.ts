import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';

import type { teachersEvaluationSemesterWiseRoute } from './routes';

export const teachersEvaluationSemesterWise: AppRouteHandler<teachersEvaluationSemesterWiseRoute> = async (c: any) => {
  const { semester_uuid } = c.req.valid('query');

  const query = sql`
                    SELECT 
                          sche.uuid,
                          sche.semester_uuid,
                          sche.teachers_uuid,
                          thr.appointment_date,
                          thr.department_name,
                          thr.teacher_name,
                          evaluation.performance_key
                    FROM lib.sem_crs_thr_entry sche
                    LEFT JOIN (
                          SELECT 
                                thr.uuid,
                                thr.appointment_date,
                                d.name AS department_name,
                                u.name AS teacher_name
                          FROM portfolio.teachers thr
                          LEFT JOIN portfolio.department_teachers dt ON thr.uuid = dt.teachers_uuid
                          LEFT JOIN portfolio.department d ON dt.department_uuid = d.uuid
                          LEFT JOIN hr.users u ON thr.teacher_uuid = u.uuid
                          GROUP BY thr.uuid, thr.appointment_date, d.name, u.name
                    ) AS thr ON sche.teachers_uuid = thr.uuid
                    LEFT JOIN (
                              SELECT 
                                    evaluation_per_cat.sem_crs_thr_entry_uuid,
                                    jsonb_object_agg(evaluation_per_cat.name, evaluation_per_cat.total_rating_sum) AS performance_key
                              FROM (
                                    SELECT 
                                          rt.sem_crs_thr_entry_uuid,
                                          qnc.name,
                                          SUM(e.rating) AS total_rating_sum
                                    FROM fde.qns_category qnc
                                    LEFT JOIN fde.qns qns ON qns.qns_category_uuid = qnc.uuid
                                    LEFT JOIN fde.evaluation e ON e.qns_uuid = qns.uuid
                                    LEFT JOIN fde.respond_student rt ON e.respond_student_uuid = rt.uuid
                                    GROUP BY rt.sem_crs_thr_entry_uuid, qnc.name
                              ) AS evaluation_per_cat
                              GROUP BY sem_crs_thr_entry_uuid
                    ) AS evaluation ON sche.uuid = evaluation.sem_crs_thr_entry_uuid
                    GROUP BY sche.uuid, sche.semester_uuid, sche.teachers_uuid, thr.appointment_date, thr.department_name, thr.teacher_name, evaluation.performance_key
                    WHERE sche.semester_uuid = ${semester_uuid} `;

  const resultPromise = db.execute(query);

  const data = await resultPromise;

  return c.json(data.rows, HSCode.OK);
};
