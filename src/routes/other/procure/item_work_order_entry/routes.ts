import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

import { createRoute, z } from '@hono/zod-openapi';

const tags = ['other'];

export const valueLabel = createRoute({
  path: '/other/procure/item-work-order-entry/value/label',
  method: 'get',
  tags,
  request: {
    query: z.object({
      item_work_order_uuid: z.string().optional(),
      is_item_work_order: z.string().optional(),
      store_type: z.string().optional(),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
      'The valueLabel of item_work_order_entry',
    ),
  },
});

export type ValueLabelRoute = typeof valueLabel;
