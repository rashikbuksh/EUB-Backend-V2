import type { AppRouteHandler } from "@/lib/types";
import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./routes";
import db from "@/db";

import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import * as HttpStatusPhrases from "stoker/http-status-phrases";

import { bank } from "../schema";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const bank = await db.query.bank.findMany();
  return c.json(bank);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const value = c.req.valid("json");
  const [inserted] = await db.insert(bank).values(value).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { uuid } = c.req.valid("param");
  const result = await db.query.bank.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!result) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(result, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { uuid } = c.req.valid("param");
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [result] = await db.update(bank)
    .set(updates)
    .where(eq(bank.uuid, uuid))
    .returning();

  if (!result) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(result, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { uuid } = c.req.valid("param");
  const result = await db.delete(bank)
    .where(eq(bank.uuid, uuid));

  if (result.rowCount === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
