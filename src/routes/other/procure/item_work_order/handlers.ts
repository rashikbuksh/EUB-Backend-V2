import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
// import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
// import { item_work_order, item_work_order_entry } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { vendor_uuid, is_bill, bill_uuid } = c.req.valid('query');

  const whereClauses = [
    vendor_uuid ? sql`item_work_order.vendor_uuid = ${vendor_uuid}` : sql`TRUE`,
    bill_uuid && is_bill !== 'true'
      ? bill_uuid === 'null'
        ? sql`item_work_order.bill_uuid IS NULL`
        : sql`(item_work_order.bill_uuid = ${bill_uuid} OR item_work_order.bill_uuid IS NULL)`
      : sql`TRUE`,
    is_bill === 'true' && bill_uuid
      ? sql`item_work_order.bill_uuid = ${bill_uuid}`
      : sql`TRUE`,
  ];

  const query = sql`
                  SELECT
                    item_work_order.uuid as value,
                    CONCAT('IWOI', TO_CHAR(item_work_order.created_at::timestamp, 'YY'), '-',  TO_CHAR(item_work_order.created_at::timestamp, 'MM'), '-',  TO_CHAR(item_work_order.id, 'FM0000')) AS label,
                    COALESCE(total.total_amount, 0) AS total_amount
                  FROM procure.item_work_order
                  LEFT JOIN 
                          (SELECT
                            item_work_order.uuid,
                            SUM(item_work_order_entry.provided_quantity::float8 * item_work_order_entry.unit_price::float8) AS total_amount
                          FROM procure.item_work_order
                          LEFT JOIN procure.item_work_order_entry
                            ON item_work_order.uuid = item_work_order_entry.item_work_order_uuid
                          GROUP BY item_work_order.uuid) AS total
                    ON item_work_order.uuid = total.uuid
                    WHERE
                    ${sql.join(whereClauses, sql` AND `)}`;

  const resultPromise = db.execute(query);

  const data = await resultPromise;

  return c.json(data.rows, HSCode.OK);
};
