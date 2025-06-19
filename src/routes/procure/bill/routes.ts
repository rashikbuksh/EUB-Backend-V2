import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['procure.bill'];

export const list = createRoute({
  path: '/procure/bill',
  method: 'get',
  tags,
  // request: {
  //   query: z.object({
  //     category: z.string().optional(),
  //   }),
  // },
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The list of bill',
    ),
  },
});

export const create = createRoute({
  path: '/procure/bill',
  method: 'post',
  request: {
    body: jsonContentRequired(
      insertSchema,
      'The bill to create',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The created bill',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/procure/bill/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested bill',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'bill not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/procure/bill/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      'The bill to update',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated bill',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'bill not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/procure/bill/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'bill deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'bill not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const getBillAndBillPaymentDetailsByBillUuid = createRoute({
  path: '/procure/bill-and-bill-payment-details/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      z.object({
        bill: selectSchema,
        bill_payment_details: z.array(
          z.object({
            uuid: z.string(),
            bill_uuid: z.string(),
            amount: z.number(),
            type: z.string().optional(),
            created_by: z.string(),
            created_by_name: z.string().optional(),
            created_at: z.string(),
            updated_at: z.string().optional(),
            remarks: z.string().optional(),
          }),
        ),
      }),
      'The requested bill and its payment details',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'bill not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type GetBillAndBillPaymentDetailsByBillUuidRoute = typeof getBillAndBillPaymentDetailsByBillUuid;
