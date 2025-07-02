import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

import { createRoute, z } from '@hono/zod-openapi';

const tags = ['reports'];

export const teachersEvaluationSemesterWise = createRoute({
  path: '/report/fde/teachers-evaluation-semester-wise',
  method: 'get',
  tags,
  request: {
    query: z.object({
      semester_uuid: z.string().describe('The UUID of the semester to filter evaluations'),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.object({
        rows: z.array(
          z.object({
            semester_uuid: z.string(),
            semester_name: z.string(),
            total_students: z.number(),
            total_evaluated: z.number(),
            average_score: z.number().optional(),
          }),
        ),

      }),
      'The teachers evaluation semester wise report',
    ),
  },
});

export type teachersEvaluationSemesterWiseRoute = typeof teachersEvaluationSemesterWise;
