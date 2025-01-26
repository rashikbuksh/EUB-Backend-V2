import type { Context } from 'hono';

import * as HttpStatus from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';

import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from '@/lib/constants';

export function returnEmptyObject<Updates extends Record<string, unknown>>(
  updates: Updates,
  c: Context,
) {
  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.REQUIRED,
            },
          ],
          name: 'ZodError',
        },
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export function returnNotFound(hasNoResult: boolean, c: Context) {
  if (hasNoResult) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatus.NOT_FOUND,
    );
  }
}
