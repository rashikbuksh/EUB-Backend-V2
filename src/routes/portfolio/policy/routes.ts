import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['portfolio.policy'];

export const list = createRoute({
  path: '/portfolio/policy',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: jsonContent(z.array(selectSchema), 'The list of policy'),
  },
});

export const create = createRoute({
  path: '/portfolio/policy',
  method: 'post',
  request: {
    body: jsonContentRequired(insertSchema, 'The policy to create'),

    // content: {
    //   'multipart/form-data': {
    //     schema: {
    //       ...insertSchema,
    //     },
    //   },
    // },

  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(selectSchema, 'The created policy'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/portfolio/policy/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(selectSchema, 'The requested policy'),
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'policy not found'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/portfolio/policy/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(patchSchema, 'The policy updates'),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(selectSchema, 'The updated policy'),
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'policy not found'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema).or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/portfolio/policy/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'policy deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'policy not found'),
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
