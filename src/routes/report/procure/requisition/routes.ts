import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { selectSchema } from './utils';

const tags = ['reports'];

export const itemRequisitionDetailsByUuid = createRoute({
  path: '/report/procure/item-requisition-details/by/{uuid}',
  method: 'get',
  tags,
  request: {
    // query: z.object({
    //   from_date: z.string().optional(),
    //   to_date: z.string().optional(),
    // }),
    params: param.uuid,
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The requested requisition',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'requisition not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export type itemRequisitionDetailsByUuidRoute = typeof itemRequisitionDetailsByUuid;
