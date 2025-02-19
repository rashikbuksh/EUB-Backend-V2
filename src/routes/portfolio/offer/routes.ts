import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['portfolio.offer'];

export const list = createRoute({
  path: '/portfolio/offer',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: jsonContent(z.array(selectSchema), 'The list of offer'),
  },
});

export const create = createRoute({
  path: '/portfolio/offer',
  method: 'post',
  request: {
    body: jsonContentRequired(insertSchema, 'The offer to create'),

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
    [HSCode.OK]: jsonContent(selectSchema, 'The created offer'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/portfolio/offer/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(selectSchema, 'The requested offer'),
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'offer not found'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/portfolio/offer/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(patchSchema, 'The offer updates'),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(selectSchema, 'The updated offer'),
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'offer not found'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema).or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/portfolio/offer/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'offer deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'offer not found'),
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
