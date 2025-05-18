import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

import { createRoute, z } from '@hono/zod-openapi';

const tags = ['other'];

export const valueLabel = createRoute({
  path: '/other/procure/sub-purchase-cost-center/value/label',
  method: 'get',
  tags,
  request: {
    query: z.object({
      access: z.string().optional(),
    }),
    purchase_cost_center_uuid: z.string().optional(),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
      'The valueLabel of sub purchase cost center',
    ),
  },
});

export type ValueLabelRoute = typeof valueLabel;
