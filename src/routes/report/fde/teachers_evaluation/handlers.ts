import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';

import type { teachersEvaluationDepartmentWiseRoute, teachersEvaluationSemesterWiseRoute, teachersEvaluationTeacherWiseRoute } from './routes';

export const teachersEvaluationSemesterWise: AppRouteHandler<teachersEvaluationSemesterWiseRoute> = async (c: any) => {
  const { semester_uuid } = c.req.valid('query');

  const query = sql`
  WITH teacher_info AS (
    SELECT
      thr.uuid,
      thr.appointment_date,
      d.name AS department_name,
      u.name AS teacher_name,
      des.name AS designation_name
    FROM portfolio.teachers thr
    LEFT JOIN portfolio.department_teachers dt ON thr.uuid = dt.teachers_uuid
    LEFT JOIN portfolio.department d ON dt.department_uuid = d.uuid
    LEFT JOIN hr.users u ON thr.teacher_uuid = u.uuid
    LEFT JOIN hr.designation des ON u.designation_uuid = des.uuid
  ),
  evaluation_base AS (
    SELECT
      rt.sem_crs_thr_entry_uuid,
      rt.evaluation_time,
      qnc.name AS category_name,
      e.rating
    FROM fde.respond_student rt
    INNER JOIN fde.evaluation e ON e.respond_student_uuid = rt.uuid
    INNER JOIN fde.qns qns ON e.qns_uuid = qns.uuid
    INNER JOIN fde.qns_category qnc ON qns.qns_category_uuid = qnc.uuid
    WHERE rt.evaluation_time IN ('mid', 'final')
  ),
  evaluation_aggregated AS (
    SELECT
      sem_crs_thr_entry_uuid,
      SUM(CASE WHEN evaluation_time = 'mid' THEN rating END) AS total_mid_rating_sum,
      COUNT(CASE WHEN evaluation_time = 'mid' THEN rating END) AS total_mid_rating_count,
      SUM(CASE WHEN evaluation_time = 'final' THEN rating END) AS total_final_rating_sum,
      COUNT(CASE WHEN evaluation_time = 'final' THEN rating END) AS total_final_rating_count
    FROM evaluation_base
    GROUP BY sem_crs_thr_entry_uuid
  ),
  performance_categories AS (
    SELECT 
      sem_crs_thr_entry_uuid,
      jsonb_object_agg(
        LOWER(REPLACE(category_name, ' ', '_')), 
        total_rating_sum
      ) AS performance_key
    FROM (
      SELECT
        sem_crs_thr_entry_uuid,
        category_name,
        SUM(rating) AS total_rating_sum
      FROM evaluation_base
      GROUP BY sem_crs_thr_entry_uuid, category_name
    ) cat_totals
    GROUP BY sem_crs_thr_entry_uuid
  )
  SELECT
    sche.uuid,
    sche.semester_uuid,
    sem.name AS semester_name,
    sche.teachers_uuid,
    ti.appointment_date,
    ti.department_name,
    ti.teacher_name,
    ti.designation_name,
    pc.performance_key,
    ROUND(
      (ea.total_mid_rating_sum::DECIMAL / NULLIF(ea.total_mid_rating_count, 0) / 5.0) * 100,
      2
    )::float8 AS mid_performance_percentage,
    ROUND(
      (ea.total_final_rating_sum::DECIMAL / NULLIF(ea.total_final_rating_count, 0) / 5.0) * 100,
      2
    )::float8 AS final_performance_percentage,
    ROUND(
      (
        COALESCE((ea.total_mid_rating_sum::DECIMAL / NULLIF(ea.total_mid_rating_count, 0) / 5.0) * 100, 0) +
        COALESCE((ea.total_final_rating_sum::DECIMAL / NULLIF(ea.total_final_rating_count, 0) / 5.0) * 100, 0)
      ) / CASE WHEN (ea.total_mid_rating_sum IS NOT NULL OR ea.total_final_rating_count IS NOT NULL) THEN 2.0 ELSE 1.0 END,
      2
    )::float8 AS average_performance_percentage,
    ROUND(
      COALESCE((ea.total_final_rating_sum::DECIMAL / NULLIF(ea.total_final_rating_count, 0) / 5.0) * 100, 0) -
      COALESCE((ea.total_mid_rating_sum::DECIMAL / NULLIF(ea.total_mid_rating_count, 0) / 5.0) * 100, 0),
      2
    )::float8 AS change_in_performance_percentage
  FROM lib.sem_crs_thr_entry sche
  INNER JOIN lib.semester sem ON sche.semester_uuid = sem.uuid
  LEFT JOIN teacher_info ti ON sche.teachers_uuid = ti.uuid
  LEFT JOIN evaluation_aggregated ea ON sche.uuid = ea.sem_crs_thr_entry_uuid
  LEFT JOIN performance_categories pc ON sche.uuid = pc.sem_crs_thr_entry_uuid
  WHERE sche.semester_uuid = ${semester_uuid}
  ORDER BY ti.teacher_name, sem.started_at;
`;

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
                extract(YEAR FROM sem.started_at) AS semester_year,
                thr.appointment_date,
                sche.teachers_uuid,
                thr.department_uuid,
                thr.department_name,
                thr.teacher_name,
                thr.designation_name,
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
                            u.name AS teacher_name,
                            des.name AS designation_name
                      FROM portfolio.teachers thr
                            LEFT JOIN portfolio.department_teachers dt ON thr.uuid = dt.teachers_uuid
                            LEFT JOIN portfolio.department d ON dt.department_uuid = d.uuid
                            LEFT JOIN hr.users u ON thr.teacher_uuid = u.uuid
                            LEFT JOIN hr.designation des ON u.designation_uuid = des.uuid
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

  // Group data by teacher name and then by year and semester and then score as an object
  const teacherMap = new Map();

  data.rows
    .filter((row: any) => row.teacher_name)
    .forEach((row: any) => {
      const teacherName = row.teacher_name;
      const semesterYear = Number.parseInt(row.semester_year);

      if (!teacherMap.has(teacherName)) {
        teacherMap.set(teacherName, {
          teacher_name: teacherName,
          department_name: row.department_name,
          designation_name: row.designation_name,
          year: [],
        });
      }

      const teacher = teacherMap.get(teacherName);

      // Find existing year or create new one
      let yearEntry = teacher.year.find((y: any) => y.semester_year === semesterYear);
      if (!yearEntry) {
        yearEntry = {
          semester_year: semesterYear,
          semester: [],
        };
        teacher.year.push(yearEntry);
      }

      // Add semester to the year
      yearEntry.semester.push({
        name: row.semester_name,
        score: {
          mid_performance_percentage: Number.parseFloat(row.mid_performance_percentage) || 0,
          final_performance_percentage: Number.parseFloat(row.final_performance_percentage) || 0,
        },
      });
    });

  // Convert Map to Array and sort years
  const formattedData = Array.from(teacherMap.values()).map(teacher => ({
    ...teacher,
    year: teacher.year.sort((a: any, b: any) => a.semester_year - b.semester_year),
  }));

  // Return the formatted data
  return c.json(formattedData, HSCode.OK);
};

export const teachersEvaluationDepartmentWise: AppRouteHandler<teachersEvaluationDepartmentWiseRoute> = async (c: any) => {
  const { department_uuid } = c.req.valid('query');

  const query = sql`
              SELECT
                    sche.uuid,
                    sche.semester_uuid,
                    sem.name AS semester_name,
                    extract(YEAR FROM sem.started_at) AS semester_year,
                    thr.department_uuid,
                    thr.department_name,
                    ROUND(
                          AVG(
                              evaluation_on_time.total_mid_rating_sum::DECIMAL / evaluation_on_time.total_mid_rating_count::DECIMAL 
                          ) / 5.0 * 100,
                          2
                    )::float8 AS mid_performance_percentage,
                    ROUND(
                          AVG(
                                evaluation_on_time.total_final_rating_sum::DECIMAL / evaluation_on_time.total_final_rating_count::DECIMAL 
                          ) / 5.0 * 100,
                          2
                    )::float8 AS final_performance_percentage,
                    ROUND(
                  (
                        CASE
                              WHEN SUM(
                              evaluation_on_time.total_mid_rating_sum::DECIMAL / evaluation_on_time.total_mid_rating_count::DECIMAL
                              ) IS NOT NULL THEN COALESCE(
                              SUM(
                                    evaluation_on_time.total_mid_rating_sum::DECIMAL / evaluation_on_time.total_mid_rating_count::DECIMAL
                              ) / 5.0 * 100,
                              0
                              )
                              ELSE 0
                        END + CASE
                              WHEN SUM(
                              evaluation_on_time.total_final_rating_sum::DECIMAL / evaluation_on_time.total_final_rating_count::DECIMAL
                              ) IS NOT NULL THEN COALESCE(
                              SUM(
                                    evaluation_on_time.total_final_rating_sum::DECIMAL / evaluation_on_time.total_final_rating_count::DECIMAL
                              ) / 5.0 * 100,
                              0
                              )
                              ELSE 0
                        END
                  ) / CASE
                        WHEN SUM(
                              evaluation_on_time.total_final_rating_sum::DECIMAL / evaluation_on_time.total_final_rating_count::DECIMAL
                        ) IS NOT NULL
                        AND SUM(
                              evaluation_on_time.total_mid_rating_sum::DECIMAL / evaluation_on_time.total_mid_rating_count::DECIMAL
                        ) IS NOT NULL THEN 2.0
                        ELSE 1.0
                  END,
                  2
                  )::float8 AS average_performance_percentage
              FROM
                    lib.sem_crs_thr_entry sche
              LEFT JOIN lib.semester sem ON sche.semester_uuid = sem.uuid
              LEFT JOIN (
                          SELECT
                                thr.uuid,
                                d.uuid as department_uuid,
                                d.name AS department_name
                          FROM portfolio.teachers thr
                                LEFT JOIN portfolio.department_teachers dt ON thr.uuid = dt.teachers_uuid
                                LEFT JOIN portfolio.department d ON dt.department_uuid = d.uuid
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
              WHERE ${department_uuid ? sql`thr.department_uuid = ${department_uuid}` : sql`true`}
            GROUP BY sche.uuid, sche.semester_uuid, sem.name, thr.department_uuid, thr.department_name, sem.started_at;
            `;

  const resultPromise = db.execute(query);

  const data = await resultPromise;

  //   [
  //       {
  //        "spring 2024": 85,
  //        "fall 2024": 90,
  //         "spring 2025": 88, "semester_name": average_performance_percentage
  //       },
  //   ]

  // i want data like the above

  //   const formattedData = data.rows?.map((item: any) => ({
  //     [item.semester_name]: item.average_performance_percentage,
  //   }));
  const formattedData = data.rows?.reduce((acc: any, item: any) => {
    const formattedSemesterName = item.semester_name.toLowerCase().replace(/\s+/g, '_');
    acc[formattedSemesterName] = item.average_performance_percentage;
    return acc;
  }, {});

  // Return the formatted data
  return c.json([formattedData], HSCode.OK);
};
