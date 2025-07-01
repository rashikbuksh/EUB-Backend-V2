import type { AppRouteHandler } from '@/lib/types';

import { desc, eq, sql } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { generateDynamicId } from '@/lib/dynamic_id';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, GetWorkOrderDEtailsByWorkOrderUuidRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { bill, item_work_order, vendor } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const work_order_file = formData.work_order_file;
  const delivery_statement_file = formData.delivery_statement_file;

  const workOrderFilePath = work_order_file ? await insertFile(work_order_file, 'public/item-work-order/work-order') : null;
  const deliveryStatementFilePath = delivery_statement_file ? await insertFile(delivery_statement_file, 'public/item-work-order/delivery-statement') : null;

  const newId = await generateDynamicId(item_work_order, item_work_order.id, item_work_order.created_at);

  const value = {
    uuid: formData.uuid,
    bill_uuid: formData.bill_uuid,
    vendor_uuid: formData.vendor_uuid,
    work_order_file: workOrderFilePath,
    work_order_remarks: formData.work_order_remarks,
    is_delivery_statement: formData.is_delivery_statement || false,
    delivery_statement_date: formData.delivery_statement_date,
    delivery_statement_file: deliveryStatementFilePath,
    delivery_statement_remarks: formData.delivery_statement_remarks,
    done: formData.done || false,
    done_date: formData.done_date,
    created_by: formData.created_by,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(item_work_order).values({
    id: newId,
    ...value,
  }).returning({
    name: item_work_order.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const formData = await c.req.parseBody();

  if ('bill_uuid' in formData && (formData.bill_uuid === '' || formData.bill_uuid == null)) {
    formData.bill_uuid = null;
  }

  const [existingItemWorkOrder] = await db.select()
    .from(item_work_order)
    .where(eq(item_work_order.uuid, uuid));

  // Handle file fields
  const fileFields = [
    { key: 'work_order_file', path: 'public/item-work-order/work-order' },
    { key: 'delivery_statement_file', path: 'public/item-work-order/delivery-statement' },
  ];

  const existingItemWorkOrderObj = existingItemWorkOrder as Record<string, any>;

  for (const { key, path } of fileFields) {
    if (formData[key] && typeof formData[key] === 'object') {
      if (existingItemWorkOrderObj && existingItemWorkOrderObj[key]) {
        formData[key] = await updateFile(formData[key], existingItemWorkOrderObj[key], path);
      }
      else {
        formData[key] = await insertFile(formData[key], path);
      }
    }
  }

  // Build updates object, only including fields present in formData
  const updates = Object.fromEntries(
    Object.entries(formData).filter(([_, v]) => v !== undefined),
  );

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(item_work_order)
    .set(updates)
    .where(eq(item_work_order.uuid, uuid))
    .returning({
      name: item_work_order.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [ItemWorkOrderData] = await db.select()
    .from(item_work_order)
    .where(eq(item_work_order.uuid, uuid));

  if (ItemWorkOrderData && ItemWorkOrderData.bill_uuid) {
    return c.json(
      createToast('error', 'Cannot delete: Bill is already linked.'),
      HSCode.BAD_REQUEST,
    );
  }

  if (ItemWorkOrderData) {
    const fileFields = [
      'work_order_file',
      'delivery_statement_file',
    ];

    const ItemWorkOrderDataObj = ItemWorkOrderData as Record<string, any>;

    for (const key of fileFields) {
      if (ItemWorkOrderDataObj[key]) {
        await deleteFile(ItemWorkOrderDataObj[key]);
      }
    }
  }

  const [data] = await db.delete(item_work_order)
    .where(eq(item_work_order.uuid, uuid))
    .returning({
      name: item_work_order.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { vendor_uuid } = c.req.valid('query');

  const resultPromise = db.select({
    id: item_work_order.id,
    item_work_order_id: sql`CONCAT('PS', TO_CHAR(${item_work_order.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order.id}, 'FM0000'))`,
    uuid: item_work_order.uuid,
    vendor_uuid: item_work_order.vendor_uuid,
    vendor_name: vendor.name,
    work_order_file: item_work_order.work_order_file,
    work_order_remarks: item_work_order.work_order_remarks,
    is_delivery_statement: item_work_order.is_delivery_statement,
    delivery_statement_date: item_work_order.delivery_statement_date,
    delivery_statement_file: item_work_order.delivery_statement_file,
    delivery_statement_remarks: item_work_order.delivery_statement_remarks,
    done: item_work_order.done,
    done_date: item_work_order.done_date,
    created_at: item_work_order.created_at,
    updated_at: item_work_order.updated_at,
    created_by: item_work_order.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_work_order.remarks,
    bill_uuid: item_work_order.bill_uuid,
    bill_id: sql`CONCAT('BI', TO_CHAR(${bill.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${bill.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${bill.id}, 'FM0000'))`,
    total_amount: sql`COALESCE((
      SELECT SUM(item_work_order_entry.provided_quantity::float8 * item_work_order_entry.unit_price::float8)
      FROM procure.item_work_order_entry
      WHERE item_work_order_entry.item_work_order_uuid = ${item_work_order.uuid}
    ), 0)`,
    estimated_date: item_work_order.estimated_date,
    subject: item_work_order.subject,
    vendor_address: vendor.address,
    vendor_phone: vendor.phone,
  })
    .from(item_work_order)
    .leftJoin(hrSchema.users, eq(item_work_order.created_by, hrSchema.users.uuid))
    .leftJoin(vendor, eq(item_work_order.vendor_uuid, vendor
      .uuid))
    .leftJoin(bill, eq(item_work_order.bill_uuid, bill.uuid))
    .orderBy(desc(item_work_order.created_at));

  if (vendor_uuid) {
    resultPromise.where(eq(item_work_order.vendor_uuid, vendor_uuid));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: item_work_order.uuid,
    vendor_uuid: item_work_order.vendor_uuid,
    vendor_name: vendor.name,
    work_order_file: item_work_order.work_order_file,
    work_order_remarks: item_work_order.work_order_remarks,
    is_delivery_statement: item_work_order.is_delivery_statement,
    delivery_statement_date: item_work_order.delivery_statement_date,
    delivery_statement_file: item_work_order.delivery_statement_file,
    delivery_statement_remarks: item_work_order.delivery_statement_remarks,
    done: item_work_order.done,
    done_date: item_work_order.done_date,
    created_at: item_work_order.created_at,
    updated_at: item_work_order.updated_at,
    created_by: item_work_order.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_work_order.remarks,
    bill_uuid: item_work_order.bill_uuid,
    bill_id: sql`CONCAT('BI', TO_CHAR(${bill.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${bill.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${bill.id}, 'FM0000'))`,
    estimated_date: item_work_order.estimated_date,
    subject: item_work_order.subject,
    vendor_address: vendor.address,
    vendor_phone: vendor.phone,
  })
    .from(item_work_order)
    .leftJoin(hrSchema.users, eq(item_work_order.created_by, hrSchema.users.uuid))
    .leftJoin(vendor, eq(item_work_order.vendor_uuid, vendor.uuid))
    .where(eq(item_work_order.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};

export const getWorkOrderDEtailsByWorkOrderUuid: AppRouteHandler<GetWorkOrderDEtailsByWorkOrderUuidRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.item_work_order.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  //   with: {
  //     item_work_order_entry: {
  //       extras: {
  //         quantity: PG_DECIMAL_TO_FLOAT(sql`${item_work_order_entry}.quantity`).as('quantity'),
  //         unit_price: PG_DECIMAL_TO_FLOAT(sql`${item_work_order_entry}.unit_price`).as('unit_price'),
  //         name: sql`(SELECT item.name FROM procure.item WHERE item.uuid = ${sql`${item_work_order_entry}.item_uuid`})`.as('name'),
  //       },
  //       orderBy: (item_work_order_entry, { asc }) => [asc(item_work_order_entry.created_at)],
  //     },
  //   },
  // });

  const resultPromise = db.select({
    uuid: item_work_order.uuid,
    vendor_uuid: item_work_order.vendor_uuid,
    vendor_name: vendor.name,
    work_order_file: item_work_order.work_order_file,
    work_order_remarks: item_work_order.work_order_remarks,
    is_delivery_statement: item_work_order.is_delivery_statement,
    delivery_statement_date: item_work_order.delivery_statement_date,
    delivery_statement_file: item_work_order.delivery_statement_file,
    delivery_statement_remarks: item_work_order.delivery_statement_remarks,
    done: item_work_order.done,
    done_date: item_work_order.done_date,
    id: item_work_order.id,
    item_work_order_id: sql`CONCAT('PS', TO_CHAR(${item_work_order.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order.id}, 'FM0000'))`,
    created_at: item_work_order.created_at,
    updated_at: item_work_order.updated_at,
    created_by: item_work_order.created_by,
    created_by_name: hrSchema.users.name,
    remarks: item_work_order.remarks,
    bill_uuid: item_work_order.bill_uuid,
    bill_id: sql`CONCAT('BI', TO_CHAR(${bill.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${bill.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${bill.id}, 'FM0000'))`,
    estimated_date: item_work_order.estimated_date,
    subject: item_work_order.subject,
    item_work_order_entry: sql`COALESCE(ARRAY(SELECT json_build_object(
        'uuid', item_work_order_entry.uuid,
        'item_work_uuid', item_work_order_entry.item_work_order_uuid,
        'item_uuid', item_work_order_entry.item_uuid,
        'item_name', item.name,
        'request_quantity', item_work_order_entry.request_quantity::float8,
        'provided_quantity', item_work_order_entry.provided_quantity::float8,
        'unit_price', item_work_order_entry.unit_price::float8,
        'created_by', item_work_order_entry.created_by,
        'created_at', item_work_order_entry.created_at,
        'updated_at', item_work_order_entry.updated_at,
        'remarks', item_work_order_entry.remarks,
        'index' , item_work_order_entry.index
      )
      FROM procure.item_work_order_entry
      LEFT JOIN procure.item ON item_work_order_entry.item_uuid = item.uuid
      WHERE item_work_order_entry.item_work_order_uuid = ${item_work_order.uuid}
      ORDER BY item_work_order_entry.index ASC), '{}')`,
  })
    .from(item_work_order)
    .leftJoin(hrSchema.users, eq(item_work_order.created_by, hrSchema.users.uuid))
    .leftJoin(vendor, eq(item_work_order.vendor_uuid, vendor.uuid))
    .leftJoin(bill, eq(item_work_order.bill_uuid, bill.uuid))
    .where(eq(item_work_order.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
