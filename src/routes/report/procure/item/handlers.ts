import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';

import type { itemOpeningClosingStockRoute } from './routes';

export const itemOpeningClosingStock: AppRouteHandler<itemOpeningClosingStockRoute> = async (c: any) => {
  const { from_date, to_date } = c.req.valid('query');

  const query = sql`
                    SELECT
                        uuid AS item_uuid,
                        item.name AS item_name,
                        unit,
                        COALESCE(opening_purchase.total_purchase_quantity, 0) - COALESCE(item_requisition_opening_consumption.total_item_requisition_consumption_quantity, 0) - COALESCE(item_transfer_opening_consumption.total_item_transfer_consumption_quantity, 0) AS item_opening_quantity,
                        COALESCE(purchase.total_purchase_quantity, 0) AS item_purchased_quantity,
                        COALESCE(item_requisition_consumption.total_item_requisition_consumption_quantity, 0) + COALESCE(item_transfer_consumption.total_item_transfer_consumption_quantity, 0) AS item_consumption_quantity,
                        (COALESCE(opening_purchase.total_purchase_quantity, 0) - COALESCE(item_requisition_opening_consumption.total_item_requisition_consumption_quantity, 0) - COALESCE(item_transfer_opening_consumption.total_item_transfer_consumption_quantity, 0)) + COALESCE(purchase.total_purchase_quantity, 0) - (COALESCE(item_requisition_consumption.total_item_requisition_consumption_quantity, 0) + COALESCE(item_transfer_consumption.total_item_transfer_consumption_quantity, 0)) AS item_closing_quantity
                    FROM
                        procure.item 
                    LEFT JOIN (
                        SELECT
                            item_uuid,
                            SUM(quantity)::float8 as total_purchase_quantity
                        FROM
                            procure.item_work_order_entry
                        WHERE 
                            created_at::date < ${from_date} AND is_received = true AND item_uuid IS NOT NULL
                        GROUP BY item_uuid

                        )opening_purchase ON item.uuid = opening_purchase.item_uuid
                    LEFT JOIN(
                        SELECT
                            item_uuid,
                            SUM(quantity)::float8 as total_purchase_quantity
                        FROM
                            procure.item_work_order_entry
                        WHERE 
                            created_at::date >= ${from_date} AND created_at::date <= ${to_date} AND is_received = true AND item_uuid IS NOT NULL
                        GROUP BY item_uuid
                    )purchase ON item.uuid = purchase.item_uuid
                    LEFT JOIN(
                        SELECT
                            item_uuid,
                            SUM(COALESCE(provided_quantity, 0))::float8 as total_item_requisition_consumption_quantity
                        FROM
                            procure.item_requisition
                        WHERE 
                            created_at::date >= ${from_date} AND created_at::date <= ${to_date} AND item_uuid IS NOT NULL
                        GROUP BY item_uuid
                    )item_requisition_consumption ON item.uuid = item_requisition_consumption.item_uuid 

                    LEFT JOIN(
                        SELECT
                            item_uuid,
                            SUM(COALESCE(quantity, 0))::float8 as total_item_transfer_consumption_quantity
                        FROM
                            procure.item_transfer
                        WHERE 
                            created_at::date >= ${from_date} AND created_at::date <= ${to_date} AND item_uuid IS NOT NULL
                        GROUP BY item_uuid
                    )item_transfer_consumption ON item.uuid = item_transfer_consumption.item_uuid

                     LEFT JOIN(
                        SELECT
                            item_uuid,
                            SUM(COALESCE(provided_quantity, 0))::float8 as total_item_requisition_consumption_quantity
                        FROM
                            procure.item_requisition
                        WHERE 
                            created_at::date <= ${from_date} AND item_uuid IS NOT NULL
                        GROUP BY item_uuid
                    )item_requisition_opening_consumption ON item.uuid = item_requisition_opening_consumption.item_uuid
                    LEFT JOIN(
                        SELECT
                            item_uuid,
                            SUM(COALESCE(quantity, 0))::float8 as total_item_transfer_consumption_quantity
                        FROM
                            procure.item_transfer
                        WHERE 
                            created_at::date <= ${from_date} AND item_uuid IS NOT NULL
                        GROUP BY item_uuid
                    )item_transfer_opening_consumption ON item.uuid = item_transfer_opening_consumption.item_uuid
                    ORDER BY item_name
                    `;

  const resultPromise = db.execute(query);

  const data = await resultPromise;

  return c.json(data.rows, HSCode.OK);
};
