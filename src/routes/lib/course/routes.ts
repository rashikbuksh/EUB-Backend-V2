import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['lib.course'];

export const list = createRoute({
  path: '/lib/course',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The list of course',
    ),
  },
});

export const create = createRoute({
  path: '/lib/course',
  method: 'post',
  request: {
    body: jsonContentRequired(
      insertSchema,
      'The course to create',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The created course',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/lib/course/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested course',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'course not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/lib/course/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      'The course updates',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated course',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'course not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/lib/course/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'course deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'course not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const getCourseAndSectionDetails = createRoute({
  path: '/lib/course-section-details/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
    query: z.object({
      semester_uuid: z.string().optional(),
    }),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      z.object({
        uuid: z.string(),
        name: z.string(),
        code: z.string(),
        course_section_uuid: z.string().optional(),
        course_section_name: z.string().optional(),
        class_size: z.number().optional(),
        teacher_uuid: z.string().optional(),
        created_by: z.string(),
        created_by_name: z.string(),
        created_at: z.string(),
        updated_at: z.string(),
        remarks: z.string().optional(),
      }),
      'The course details',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'course not found',
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
export type GetCourseAndSectionDetailsRoute = typeof getCourseAndSectionDetails;
