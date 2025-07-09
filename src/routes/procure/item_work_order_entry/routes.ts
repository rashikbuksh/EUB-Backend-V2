import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['procure.item_work_order_entry'];

export const list = createRoute({
  path: '/procure/item-work-order-entry',
  method: 'get',
  tags,
  request: {
    query: z.object({
      status: z.string().optional(),
      store_type: z.string().optional(),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The list of item_work_order_entry',
    ),
  },
});

export const create = createRoute({
  path: '/procure/item-work-order-entry',
  method: 'post',
  request: {
    body: jsonContentRequired(
      insertSchema,
      'The item_work_order_entry to create',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The created item_work_order_entry',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/procure/item-work-order-entry/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested item_work_order_entry',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'item_work_order_entry not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/procure/item-work-order-entry/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      'The item_work_order_entry updates',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated item_work_order_entry',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'item_work_order_entry not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/procure/item-work-order-entry/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'item_work_order_entry deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'item_work_order_entry not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const getAllByUuidRoute = createRoute({
  path: '/procure/item-work-order-entry/{item_work_order_uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'item_work_order_entry deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'item_work_order_entry not found',
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
export type GetAllByUuidRoute = typeof getAllByUuidRoute;
