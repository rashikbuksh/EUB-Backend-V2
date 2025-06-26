import type { AppRouteHandler } from '@/lib/types';

import { and, eq, isNull, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { item_work_order, vendor } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { item_work_uuid } = c.req.valid('query');

  const resultPromise = db.select({
    value: sql`DISTINCT ${vendor.uuid}`,
    label: vendor.name,
  })
    .from(vendor)
    .leftJoin(item_work_order, eq(vendor.uuid, item_work_order.vendor_uuid));

  if (item_work_uuid === 'true') {
    resultPromise.where(
      and(
        eq(item_work_order.vendor_uuid, vendor.uuid),
        isNull(item_work_order.bill_uuid),
      ),
    );
  }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
