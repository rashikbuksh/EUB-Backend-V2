import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { room } from '@/routes/lib/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { type } = c.req.valid('query');

  const resultPromise = db.select({
    value: room.uuid,
    label: room.name,
  })
    .from(room);

  if (type) {
    resultPromise.where(eq(sql`${room.type}::text`, type));
  }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
