import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';

import type { itemOpeningClosingStockRoute, itemRequisitionDetailsRoute } from './routes';

export const itemOpeningClosingStock: AppRouteHandler<itemOpeningClosingStockRoute> = async (c: any) => {
  const { from_date, to_date } = c.req.valid('query');

  //   console.log ('from_date', from_date);
  //   console.log ('to_date', to_date);

  const query = sql`
                    SELECT
                        uuid AS item_uuid,
                        item.name AS item_name,
                        unit,
                        COALESCE(opening_purchase.total_purchase_quantity, 0) - COALESCE(item_requisition_opening_consumption.total_item_requisition_consumption_quantity, 0) -  COALESCE(item_transfer_opening_consumption.total_item_transfer_consumption_quantity, 0) AS item_opening_quantity,

                        COALESCE(purchase.total_purchase_quantity, 0) AS item_purchased_quantity,

                        COALESCE(item_requisition_consumption.total_item_requisition_consumption_quantity, 0) + COALESCE(item_transfer_consumption.total_item_transfer_consumption_quantity, 0) AS item_consumption_quantity,

                        (COALESCE(opening_purchase.total_purchase_quantity, 0) - COALESCE(item_requisition_opening_consumption.total_item_requisition_consumption_quantity, 0) - COALESCE(item_transfer_opening_consumption.total_item_transfer_consumption_quantity, 0))
                         + (COALESCE(purchase.total_purchase_quantity, 0) - COALESCE(item_requisition_consumption.total_item_requisition_consumption_quantity, 0) - COALESCE(item_transfer_consumption.total_item_transfer_consumption_quantity, 0)) AS item_closing_quantity
                    FROM
                        procure.item 
                    LEFT JOIN (
                        SELECT
                            item_uuid,
                            SUM(provided_quantity)::float8 as total_purchase_quantity
                        FROM
                            procure.item_work_order_entry
                        LEFT JOIN procure.item_work_order ON item_work_order.uuid = item_work_order_entry.item_work_order_uuid
                        WHERE 
                            item_work_order.delivery_statement_date::date < ${from_date}::date AND item_work_order.is_delivery_statement = true AND item_uuid IS NOT NULL
                        GROUP BY item_uuid
                        )opening_purchase ON item.uuid = opening_purchase.item_uuid

                    LEFT JOIN(
                        SELECT
                            item_uuid,
                            SUM(provided_quantity)::float8 as total_purchase_quantity
                        FROM
                            procure.item_work_order_entry
                        LEFT JOIN procure.item_work_order ON item_work_order.uuid = item_work_order_entry.item_work_order_uuid
                        WHERE 
                            item_work_order.delivery_statement_date::date  >= ${from_date}::date AND item_work_order.delivery_statement_date::date  <= ${to_date}::date AND item_work_order.is_delivery_statement = true AND item_uuid IS NOT NULL
                        GROUP BY item_uuid
                    )purchase ON item.uuid = purchase.item_uuid

                    LEFT JOIN(
                        SELECT
                            item_uuid,
                            SUM(COALESCE(provided_quantity, 0))::float8 as total_item_requisition_consumption_quantity
                        FROM
                            procure.item_requisition
                        LEFT JOIN procure.requisition ON item_requisition.requisition_uuid = requisition.uuid
                        WHERE 
                            requisition.received_date::date >= ${from_date}::date AND requisition.received_date::date <= ${to_date}::date AND item_uuid IS NOT NULL AND requisition.is_received = true
                        GROUP BY item_uuid
                    )item_requisition_consumption ON item.uuid = item_requisition_consumption.item_uuid 

                   LEFT JOIN(
                        SELECT
                            item_uuid,
                            SUM(COALESCE(quantity, 0))::float8 as total_item_transfer_consumption_quantity
                        FROM
                            procure.item_transfer
                        WHERE 
                            created_at::date >= ${from_date}::date AND created_at::date <= ${to_date}::date AND item_uuid IS NOT NULL
                        GROUP BY item_uuid
                    )item_transfer_consumption ON item.uuid = item_transfer_consumption.item_uuid

                     LEFT JOIN(
                        SELECT
                            item_uuid,
                            SUM(COALESCE(provided_quantity, 0))::float8 as total_item_requisition_consumption_quantity
                        FROM
                            procure.item_requisition
                        LEFT JOIN procure.requisition ON item_requisition.requisition_uuid = requisition.uuid
                        WHERE 
                            requisition.received_date::date < ${from_date}::date AND item_uuid IS NOT NULL AND requisition.is_received = true
                        GROUP BY item_uuid
                    )item_requisition_opening_consumption ON item.uuid = item_requisition_opening_consumption.item_uuid
                    LEFT JOIN(
                        SELECT
                            item_uuid,
                            SUM(COALESCE(quantity, 0))::float8 as total_item_transfer_consumption_quantity
                        FROM
                            procure.item_transfer
                        WHERE 
                            created_at::date < ${from_date}::date AND item_uuid IS NOT NULL
                        GROUP BY item_uuid
                    )item_transfer_opening_consumption ON item.uuid = item_transfer_opening_consumption.item_uuid
                    ORDER BY item_name
                    `;

  const resultPromise = db.execute(query);

  const data = await resultPromise;

  return c.json(data.rows, HSCode.OK);
};

export const itemRequisitionDetails: AppRouteHandler<itemRequisitionDetailsRoute> = async (c: any) => {
  const { from_date, to_date } = c.req.valid('query');

  const query = sql`
                    SELECT
                        item.uuid AS item_uuid,
                        item.name AS item_name,
                        COALESCE(item_requisition_req_quantity.req_quantity, 0) AS req_quantity,
                        COALESCE(item_requisition_provided_quantity.provided_quantity, 0) AS provided_quantity
                    FROM
                        procure.item
                    LEFT JOIN 
                        (SELECT
                            item_uuid,
                            SUM(req_quantity)::float8 AS req_quantity
                        FROM
                            procure.item_requisition
                        WHERE 
                            item_requisition.created_at::date >= ${from_date}::date AND item_requisition.created_at::date <= ${to_date}::date AND item_requisition.item_uuid IS NOT NULL 
                        GROUP BY item_uuid) AS item_requisition_req_quantity ON item.uuid = item_requisition_req_quantity.item_uuid
                    LEFT JOIN
                        (SELECT
                            item_uuid,
                            SUM(provided_quantity)::float8 AS provided_quantity
                        FROM
                            procure.item_requisition
                        LEFT JOIN procure.requisition ON item_requisition.requisition_uuid = requisition.uuid
                        WHERE 
                            requisition.received_date::date >= ${from_date}::date AND requisition.received_date::date <= ${to_date}::date AND item_requisition.item_uuid IS NOT NULL AND requisition.is_received = true
                        GROUP BY item_uuid) AS item_requisition_provided_quantity ON item.uuid = item_requisition_provided_quantity.item_uuid
                    ORDER BY item.name
                    `;

  const resultPromise = db.execute(query);

  const data = await resultPromise;

  return c.json(data.rows, HSCode.OK);
};
