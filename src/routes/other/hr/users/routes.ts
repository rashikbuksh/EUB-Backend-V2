import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

import { createRoute, z } from '@hono/zod-openapi';

const tags = ['other'];

export const valueLabel = createRoute({
  path: '/other/hr/users/value/label',
  method: 'get',
  tags,
  request: {
    query: z.object({
      is_teacher: z.string().optional(),
      teacher_uuid: z.string().optional(),
      is_new_auth: z.string().optional(),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
      'The valueLabel of user',
    ),
  },
});

export const userAccess = createRoute({
  path: '/other/hr/users-can-access/value/label',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      z.object({
        value: z.string(),
        label: z.string(),
        can_access: z.string(),
      }),
      'The valueLabel can_access of user',
    ),
  },
});

export type ValueLabelRoute = typeof valueLabel;
export type UserAccessRoute = typeof userAccess;
