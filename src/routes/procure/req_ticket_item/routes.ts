import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['procure.req_ticket_item'];

export const list = createRoute({
  path: '/procure/req-ticket-item',
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
      'The list of req_ticket_item',
    ),
  },
});

export const create = createRoute({
  path: '/procure/req-ticket-item',
  method: 'post',
  request: {
    body: jsonContentRequired(
      insertSchema,
      'The req_ticket_item to create',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The created req_ticket_item',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/procure/req-ticket-item/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested req_ticket_item',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'req_ticket_item not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/procure/req-ticket-item/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      'The req_ticket_item to update',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated req_ticket_item',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'req_ticket_item not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/procure/req-ticket-item/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'req_ticket_item deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'req_ticket_item not found',
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
