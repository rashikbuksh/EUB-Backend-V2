import { notFoundSchema } from "@/lib/constants";
import * as param from "@/lib/param";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { insertSchema, patchSchema, selectSchema } from "./utils";

const tags = ["hr.designation"];

export const list = createRoute({
  path: "/hr/designation",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectSchema),
      "The list of designation",
    ),
  },
});

export const create = createRoute({
  path: "/hr/designation",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertSchema,
      "The designation to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSchema,
      "The created designation",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/hr/designation/{uuid}",
  method: "get",
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSchema,
      "The requested designation",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Designation not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/hr/designation/{uuid}",
  method: "patch",
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      "The designation updates",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSchema,
      "The updated designation",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Designation not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/hr/designation/{uuid}",
  method: "delete",
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Designation deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Designation not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      "Invalid id error",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
