import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

import { createRoute, z } from '@hono/zod-openapi';

const tags = ['reports'];

export const itemOpeningClosingStock = createRoute({
  path: '/report/procure/item-opening-closing-stock',
  method: 'get',
  tags,
  request: {
    query: z.object({
      from_date: z.string().optional(),
      to_date: z.string().optional(),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.object({
        item_uuid: z.string(),
        item_name: z.string(),
        item_opening_quantity: z.number(),
        item_purchased_quantity: z.number(),
        item_consumption_quantity: z.number(),
        item_closing_quantity: z.number(),
      }),
      'The valueLabel of department',
    ),
  },
});

export type itemOpeningClosingStockRoute = typeof itemOpeningClosingStock;
