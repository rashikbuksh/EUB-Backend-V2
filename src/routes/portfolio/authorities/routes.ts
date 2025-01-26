import * as HttpStatus from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['portfolio.authority'];

export const list = createRoute({
  path: '/portfolio/authorities',
  method: 'get',
  tags,
  responses: {
    [HttpStatus.OK]: jsonContent(
      z.array(selectSchema),
      'The list of authorities',
    ),
  },
});

export const create = createRoute({
  path: '/portfolio/authorities',
  method: 'post',
  request: {
    body: jsonContentRequired(
      insertSchema,
      'The authorities to create',
    ),
  },
  tags,
  responses: {
    [HttpStatus.OK]: jsonContent(
      selectSchema,
      'The created authorities',
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/portfolio/authorities/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HttpStatus.OK]: jsonContent(
      selectSchema,
      'The requested authorities',
    ),
    [HttpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Authorities not found',
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/portfolio/authorities/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      'The authorities updates',
    ),
  },
  tags,
  responses: {
    [HttpStatus.OK]: jsonContent(
      selectSchema,
      'The updated authorities',
    ),
    [HttpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Authorities not found',
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/portfolio/authorities/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HttpStatus.NO_CONTENT]: {
      description: 'Authorities deleted',
    },
    [HttpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Authorities not found',
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
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
