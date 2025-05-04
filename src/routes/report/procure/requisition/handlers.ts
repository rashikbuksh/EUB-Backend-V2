import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { DataNotFound } from '@/utils/return';

import type { itemRequisitionDetailsByUuidRoute } from './routes';

import { requisition } from './../../../procure/schema';

export const itemRequisitionDetailsByUuid: AppRouteHandler<itemRequisitionDetailsByUuidRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select(
    {
      uuid: requisition.uuid,
      id: requisition.id,
      requisition_id: sql`CONCAT('RI', TO_CHAR(${requisition.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${requisition.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${requisition.id}, 'FM0000'))`,
      is_received: requisition.is_received,
      received_date: requisition.received_date,
      created_at: requisition.created_at,
      updated_at: requisition.updated_at,
      created_by: requisition.created_by,
      created_by_name: hrSchema.users.name,
      remarks: requisition.remarks,
      item_requisition: sql`COALESCE(ARRAY(
                    WITH LatestReceived AS (
                        SELECT
                            pri.requisition_uuid,
                            pri.item_uuid,
                            MAX(pr.received_date) AS latest_received_date,
                            pri.created_by AS requisition_created_by
                        FROM
                            procure.item_requisition pri
                        LEFT JOIN
                            procure.requisition pr ON
                                pri.requisition_uuid = pr.uuid AND
                                pr.is_received = true AND pr.created_by = pri.created_by
                        GROUP BY
                            pri.requisition_uuid,
                            pri.item_uuid,
                            pri.created_by
                    )
                    SELECT json_build_object(
                        'uuid', pri.uuid,
                        'requisition_uuid', pri.requisition_uuid,
                        'item_uuid', pri.item_uuid,
                        'provided_quantity', pri.provided_quantity,
                        'created_by', pri.created_by,
                        'item_name', pi.name,
                        'created_at', pri.created_at,
                        'updated_at', pri.updated_at,
                        'remarks', pri.remarks,
                        'created_by_name', users.name,
                        'is_received', pr.is_received,
                        'received_date', pr.received_date,
                        'requisition_created_by', pr.created_by
                    )
                    FROM
                        procure.item_requisition pri
                    LEFT JOIN
                        procure.item pi ON
                            pri.item_uuid = pi.uuid
                    LEFT JOIN
                        hr.users ON
                            pri.created_by = hr.users.uuid
                    LEFT JOIN
                        procure.requisition pr ON
                            pri.requisition_uuid = pr.uuid AND
                            pr.is_received = true AND pr.created_by = pri.created_by
                    INNER JOIN
                        LatestReceived lr ON
                            pri.requisition_uuid = lr.requisition_uuid AND
                            pri.item_uuid = lr.item_uuid AND
                            pr.received_date = lr.latest_received_date
                    WHERE pri.requisition_uuid = ${requisition.uuid} 
                    ORDER BY pri.created_at DESC
                    ), '{}')`,
    },
  )
    .from(requisition)
    .leftJoin(hrSchema.users, eq(requisition.created_by, hrSchema.users.uuid))
    .where(eq(requisition.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0], HSCode.OK);
};
