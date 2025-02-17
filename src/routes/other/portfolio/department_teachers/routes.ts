import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

import { createRoute, z } from '@hono/zod-openapi';

const tags = ['other'];

export const valueLabelForPublication = createRoute({
  path: '/other/portfolio/department-teachers-publication/value/label',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
      'The valueLabel of department',
    ),
  },
  request: {
    query: z.object({
      latest: z.string().optional(),
      limit: z.string().optional(),
      page: z.string().optional(),
      q: z.string().optional(),
      sort: z.string().optional(),
      orderby: z.string().optional(),
      is_pagination: z.string().optional(),
    }),
  },
});

export type ValueLabelRouteForPublication = typeof valueLabelForPublication;
