import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['procure.service'];

export const list = createRoute({
  path: '/procure/service',
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
      'The list of service',
    ),
  },
});

export const create = createRoute({
  path: '/procure/service',
  method: 'post',
  request: {
    body: jsonContentRequired(
      insertSchema,
      'The service to create',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The created service',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/procure/service/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested service',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'service not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const getOneDetails = createRoute({
  path: '/procure/service-details/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested service',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'service not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/procure/service/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      'The service updates',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated service',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'service not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/procure/service/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'service deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'service not found',
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
export type GetOneDetailsRoute = typeof getOneDetails;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
