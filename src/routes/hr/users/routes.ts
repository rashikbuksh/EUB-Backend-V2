import * as HttpStatus from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema, unauthorizedSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema, signinOutputSchema, signinSchema } from '../users/utils';

const tags = ['hr.user'];

export const list = createRoute({
  path: '/hr/users',
  method: 'get',
  tags,
  responses: {
    [HttpStatus.OK]: jsonContent(
      z.array(selectSchema),
      'The list of user',
    ),
  },
});

export const create = createRoute({
  path: '/hr/users',
  method: 'post',
  request: {
    body: jsonContentRequired(
      insertSchema,
      'The user to create',
    ),
  },
  tags,
  responses: {
    [HttpStatus.OK]: jsonContent(
      selectSchema,
      'The created user',
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const signin = createRoute({
  path: '/signin',
  method: 'post',
  request: {
    body: jsonContentRequired(
      signinSchema,
      'The user login',
    ),
  },
  tags,
  responses: {
    [HttpStatus.OK]: jsonContent(
      signinOutputSchema,
      'The logged user',
    ),
    [HttpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found',
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
    [HttpStatus.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      'Wrong password',
    ),
  },
});

export const getOne = createRoute({
  path: '/hr/users/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HttpStatus.OK]: jsonContent(
      selectSchema,
      'The requested user',
    ),
    [HttpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found',
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/hr/users/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      'The user updates',
    ),
  },
  tags,
  responses: {
    [HttpStatus.OK]: jsonContent(
      selectSchema,
      'The updated user',
    ),
    [HttpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found',
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/hr/users/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HttpStatus.NO_CONTENT]: {
      description: 'User deleted',
    },
    [HttpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found',
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const signout = createRoute({
  path: '/signout/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HttpStatus.NO_CONTENT]: {
      description: 'User Signout',
    },
    [HttpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found',
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type SigninRoute = typeof signin;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type SignoutRoute = typeof signout;
