import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';

import type { teachersEvaluationSemesterWiseRoute, teachersEvaluationTeacherWiseRoute } from './routes';

export const teachersEvaluationSemesterWise: AppRouteHandler<teachersEvaluationSemesterWiseRoute> = async (c: any) => {
  const { semester_uuid } = c.req.valid('query');

  const query = sql`
      SELECT
            sche.uuid,
            sche.semester_uuid,
            sem.name AS semester_name,
            sche.teachers_uuid,
            thr.appointment_date,
            thr.department_name,
            thr.teacher_name,
            evaluation.performance_key,
            ROUND(
                  (
                        evaluation_on_time.total_mid_rating_sum::DECIMAL / evaluation_on_time.total_mid_rating_count::DECIMAL / 5.0
                  ) * 100,
                  2
            )::float8 AS mid_performance_percentage,
            ROUND(
                  (
                        evaluation_on_time.total_final_rating_sum::DECIMAL / evaluation_on_time.total_final_rating_count::DECIMAL / 5.0
                  ) * 100,
                  2
            )::float8 AS final_performance_percentage,
            ROUND(
            (
                  COALESCE(
                        (
                        evaluation_on_time.total_mid_rating_sum::DECIMAL / evaluation_on_time.total_mid_rating_count::DECIMAL / 5.0
                        ) * 100,
                        0
                  ) + COALESCE(
                        (
                        evaluation_on_time.total_final_rating_sum::DECIMAL / evaluation_on_time.total_final_rating_count::DECIMAL / 5.0
                        ) * 100,
                        0
                  )
            ) / 2.0,
            2
            ) AS average_performance_percentage,
            ROUND((
                  (
                        evaluation_on_time.total_final_rating_sum::DECIMAL / evaluation_on_time.total_final_rating_count::DECIMAL / 5.0
                  ) * 100
            ) - (
                  (
                        evaluation_on_time.total_mid_rating_sum::DECIMAL / evaluation_on_time.total_mid_rating_count::DECIMAL / 5.0
                  ) * 100
            ), 2) AS change_in_performance_percentage
      FROM
            lib.sem_crs_thr_entry sche
      LEFT JOIN lib.semester sem ON sche.semester_uuid = sem.uuid
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
                  GROUP BY
                        thr.uuid,
                        thr.appointment_date,
                        d.name,
                        u.name
            ) AS thr ON sche.teachers_uuid = thr.uuid
      LEFT JOIN (
                  SELECT evaluation_per_cat.sem_crs_thr_entry_uuid, jsonb_object_agg(
                        evaluation_per_cat.name, evaluation_per_cat.total_rating_sum
                        ) AS performance_key
                  FROM (
                        SELECT rt.sem_crs_thr_entry_uuid, qnc.name, SUM(e.rating) AS total_rating_sum
                        FROM fde.qns_category qnc
                              LEFT JOIN fde.qns qns ON qns.qns_category_uuid = qnc.uuid
                              LEFT JOIN fde.evaluation e ON e.qns_uuid = qns.uuid
                              LEFT JOIN fde.respond_student rt ON e.respond_student_uuid = rt.uuid
                        GROUP BY
                              rt.sem_crs_thr_entry_uuid, qnc.name
                        ) AS evaluation_per_cat
                  GROUP BY
                        sem_crs_thr_entry_uuid
            ) AS evaluation ON sche.uuid = evaluation.sem_crs_thr_entry_uuid
      LEFT JOIN (
                  SELECT
                        evaluation_per_cat.sem_crs_thr_entry_uuid,
                        SUM(
                        evaluation_per_cat.total_mid_rating_sum
                        ) AS total_mid_rating_sum,
                        SUM(
                        evaluation_per_cat.total_mid_rating_count
                        ) AS total_mid_rating_count,
                        SUM(
                        evaluation_per_cat.total_final_rating_sum
                        ) AS total_final_rating_sum,
                        SUM(
                        evaluation_per_cat.total_final_rating_count
                        ) AS total_final_rating_count
                  FROM (
                        SELECT
                              rt.sem_crs_thr_entry_uuid, qnc.name, SUM(
                                    CASE
                                    WHEN rt.evaluation_time = 'mid' THEN e.rating
                                    END
                              ) AS total_mid_rating_sum, COUNT(
                                    CASE
                                    WHEN rt.evaluation_time = 'mid' THEN (e.rating)
                                    END
                              ) AS total_mid_rating_count, SUM(
                                    CASE
                                    WHEN rt.evaluation_time = 'final' THEN e.rating
                                    END
                              ) AS total_final_rating_sum, COUNT(
                                    CASE
                                    WHEN rt.evaluation_time = 'final' THEN (e.rating)
                                    END
                              ) AS total_final_rating_count
                        FROM fde.qns_category qnc
                              LEFT JOIN fde.qns qns ON qns.qns_category_uuid = qnc.uuid
                              LEFT JOIN fde.evaluation e ON e.qns_uuid = qns.uuid
                              LEFT JOIN fde.respond_student rt ON e.respond_student_uuid = rt.uuid
                        GROUP BY
                              rt.sem_crs_thr_entry_uuid, qnc.name
                        ) AS evaluation_per_cat
                  GROUP BY
                        sem_crs_thr_entry_uuid
            ) AS evaluation_on_time ON sche.uuid = evaluation_on_time.sem_crs_thr_entry_uuid
      WHERE sche.semester_uuid = ${semester_uuid} `;

  const resultPromise = db.execute(query);

  const data = await resultPromise;

  return c.json(data.rows, HSCode.OK);
};

export const teachersEvaluationTeacherWise: AppRouteHandler<teachersEvaluationTeacherWiseRoute> = async (c: any) => {
  const { department_uuid, teacher_uuid } = c.req.valid('query');

  const query = sql`
          SELECT
                sche.uuid,
                sche.semester_uuid,
                sem.name AS semester_name,
                thr.appointment_date,
                sche.teachers_uuid,
                thr.department_uuid,
                thr.department_name,
                thr.teacher_name,
                ROUND(
                      (
                            evaluation_on_time.total_mid_rating_sum::DECIMAL / evaluation_on_time.total_mid_rating_count::DECIMAL / 5.0
                      ) * 100,
                      2
                )::float8 AS mid_performance_percentage,
                ROUND(
                      (
                            evaluation_on_time.total_final_rating_sum::DECIMAL / evaluation_on_time.total_final_rating_count::DECIMAL / 5.0
                      ) * 100,
                      2
                )::float8 AS final_performance_percentage
          FROM
                lib.sem_crs_thr_entry sche
          LEFT JOIN lib.semester sem ON sche.semester_uuid = sem.uuid
          LEFT JOIN (
                      SELECT
                            thr.uuid,
                            thr.appointment_date,
                            d.uuid as department_uuid,
                            d.name AS department_name,
                            u.name AS teacher_name
                      FROM portfolio.teachers thr
                            LEFT JOIN portfolio.department_teachers dt ON thr.uuid = dt.teachers_uuid
                            LEFT JOIN portfolio.department d ON dt.department_uuid = d.uuid
                            LEFT JOIN hr.users u ON thr.teacher_uuid = u.uuid
                      GROUP BY
                            thr.uuid,
                            thr.appointment_date,
                            d.uuid,
                            d.name,
                            u.name
                ) AS thr ON sche.teachers_uuid = thr.uuid
          LEFT JOIN (
                      SELECT
                            evaluation_per_cat.sem_crs_thr_entry_uuid,
                            SUM(
                            evaluation_per_cat.total_mid_rating_sum
                            ) AS total_mid_rating_sum,
                            SUM(
                            evaluation_per_cat.total_mid_rating_count
                            ) AS total_mid_rating_count,
                            SUM(
                            evaluation_per_cat.total_final_rating_sum
                            ) AS total_final_rating_sum,
                            SUM(
                            evaluation_per_cat.total_final_rating_count
                            ) AS total_final_rating_count
                      FROM (
                            SELECT
                                  rt.sem_crs_thr_entry_uuid, qnc.name, SUM(
                                        CASE
                                        WHEN rt.evaluation_time = 'mid' THEN e.rating
                                        END
                                  ) AS total_mid_rating_sum, COUNT(
                                        CASE
                                        WHEN rt.evaluation_time = 'mid' THEN (e.rating)
                                        END
                                  ) AS total_mid_rating_count, SUM(
                                        CASE
                                        WHEN rt.evaluation_time = 'final' THEN e.rating
                                        END
                                  ) AS total_final_rating_sum, COUNT(
                                        CASE
                                        WHEN rt.evaluation_time = 'final' THEN (e.rating)
                                        END
                                  ) AS total_final_rating_count
                            FROM fde.qns_category qnc
                                  LEFT JOIN fde.qns qns ON qns.qns_category_uuid = qnc.uuid
                                  LEFT JOIN fde.evaluation e ON e.qns_uuid = qns.uuid
                                  LEFT JOIN fde.respond_student rt ON e.respond_student_uuid = rt.uuid
                            GROUP BY
                                  rt.sem_crs_thr_entry_uuid, qnc.name
                            ) AS evaluation_per_cat
                      GROUP BY
                            sem_crs_thr_entry_uuid
                ) AS evaluation_on_time ON sche.uuid = evaluation_on_time.sem_crs_thr_entry_uuid
          WHERE ${teacher_uuid ? sql`sche.teachers_uuid = ${teacher_uuid}` : sql`true`} AND ${department_uuid ? sql`thr.department_uuid = ${department_uuid}` : sql`true`}`;

  const resultPromise = db.execute(query);

  const data = await resultPromise;

  // group data using first teacher_name then under teacher semester_name and then show mid_performance_percentage, final_performance_percentage
  interface GroupedData {
    [teacherName: string]: {
      [semesterName: string]: {
        mid_performance_percentage: number;
        final_performance_percentage: number;
      };
    };
  }

  const groupedData = data.rows.reduce<GroupedData>((acc, row) => {
    const r = row as {
      teacher_name: string;
      semester_name: string;
      mid_performance_percentage: number;
      final_performance_percentage: number;
    };
    const teacherKey = r.teacher_name;
    const semesterKey = r.semester_name;

    if (!acc[teacherKey]) {
      acc[teacherKey] = {};
    }

    if (!acc[teacherKey][semesterKey]) {
      acc[teacherKey][semesterKey] = {
        mid_performance_percentage: 0,
        final_performance_percentage: 0,
      };
    }

    acc[teacherKey][semesterKey].mid_performance_percentage += r.mid_performance_percentage;
    acc[teacherKey][semesterKey].final_performance_percentage += r.final_performance_percentage;

    return acc;
  }, {});

  return c.json(Object.values(groupedData), HSCode.OK);
};
