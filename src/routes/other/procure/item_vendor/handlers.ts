import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { item_vendor, vendor } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: item_vendor.uuid,
    label: vendor.name,
  })
    .from(item_vendor)
    .leftJoin(vendor, eq(vendor.uuid, item_vendor.vendor_uuid));

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
