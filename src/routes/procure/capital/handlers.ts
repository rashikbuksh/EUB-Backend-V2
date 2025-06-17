import type { AppRouteHandler } from '@/lib/types';

import { desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { generateDynamicId } from '@/lib/dynamic_id';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { capital, capital_vendor, item_work_order_entry, sub_category, vendor } from '../schema';

const sv_vendor = alias(vendor, 'sv_vendor');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const formData = await c.req.parseBody();

  // const quotation_file = formData.quotation_file;
  // const cs_file = formData.cs_file;
  // const monthly_meeting_file = formData.monthly_meeting_file;
  const work_order_file = formData.work_order_file;
  const delivery_statement_file = formData.delivery_statement_file;

  // const quotationFilePath = quotation_file ? await insertFile(quotation_file, 'public/capital/quotation') : null;
  // const csFilePath = cs_file ? await insertFile(cs_file, 'public/capital/cs') : null;
  // const monthlyMeetingFilePath = monthly_meeting_file ? await insertFile(monthly_meeting_file, 'public/capital/monthly-meeting') : null;
  const workOrderFilePath = work_order_file ? await insertFile(work_order_file, 'public/capital/work-order') : null;
  const deliveryStatementFilePath = delivery_statement_file ? await insertFile(delivery_statement_file, 'public/capital/delivery-statement') : null;

  const newId = await generateDynamicId(capital, capital.id, capital.created_at);

  const value = {
    uuid: formData.uuid,
    index: formData.index,
    sub_category_uuid: formData.sub_category_uuid ? formData.sub_category_uuid : null,
    vendor_uuid: formData.vendor_uuid ? formData.vendor_uuid : null,
    name: formData.name,
    is_quotation: formData.is_quotation || false,
    is_cs: formData.is_cs || false,
    cs_remarks: formData.cs_remarks ? formData.cs_remarks : null,
    is_monthly_meeting: formData.is_monthly_meeting || false,
    monthly_meeting_remarks: formData.monthly_meeting_remarks ? formData.monthly_meeting_remarks : null,
    is_work_order: formData.is_work_order || false,
    work_order_remarks: formData.work_order_remarks ? formData.work_order_remarks : null,
    is_delivery_statement: formData.is_delivery_statement || false,
    delivery_statement_remarks: formData.delivery_statement_remarks ? formData.delivery_statement_remarks : null,
    done: formData.done || false,
    created_at: formData.created_at,
    updated_at: formData.updated_at ? formData.updated_at : null,
    created_by: formData.created_by,
    remarks: formData.remarks ? formData.remarks : null,
    // quotation_file: quotationFilePath,
    // cs_file: csFilePath,
    // monthly_meeting_file: monthlyMeetingFilePath,
    work_order_file: workOrderFilePath,
    delivery_statement_file: deliveryStatementFilePath,
    quotation_date: formData.quotation_date ? formData.quotation_date : null,
    cs_date: formData.cs_date ? formData.cs_date : null,
    monthly_meeting_date: formData.monthly_meeting_date ? formData.monthly_meeting_date : null,
    work_order_date: formData.work_order_date ? formData.work_order_date : null,
    delivery_statement_date: formData.delivery_statement_date ? formData.delivery_statement_date : null,
    monthly_meeting_schedule_date: formData.monthly_meeting_schedule_date ? formData.monthly_meeting_schedule_date : null,
    done_date: formData.done_date ? formData.done_date : null,
  };

  const [data] = await db.insert(capital).values({
    id: newId,
    ...value,
  }).returning({
    name: capital.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const formData = await c.req.parseBody();

  const [existingCapital] = await db.select().from(capital).where(eq(capital.uuid, uuid));

  // Handle file fields
  const fileFields = [
    // { key: 'quotation_file', path: 'public/capital/quotation' },
    // { key: 'cs_file', path: 'public/capital/cs' },
    // { key: 'monthly_meeting_file', path: 'public/capital/monthly-meeting' },
    { key: 'work_order_file', path: 'public/capital/work_order' },
    { key: 'delivery_statement_file', path: 'public/capital/delivery-statement' },
  ];

  // Add this type assertion to allow string indexing
  const existingCapitalObj = existingCapital as Record<string, any>;

  for (const { key, path } of fileFields) {
    if (formData[key] && typeof formData[key] === 'object') {
      if (existingCapitalObj && existingCapitalObj[key]) {
        formData[key] = await updateFile(formData[key], existingCapitalObj[key], path);
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

  const [data] = await db.update(capital)
    .set(updates)
    .where(eq(capital.uuid, uuid))
    .returning({
      name: capital.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [capitalData] = await db.select().from(capital).where(eq(capital.uuid, uuid));

  if (capitalData) {
    const fileFields = [
      // 'quotation_file',
      // 'cs_file',
      // 'monthly_meeting_file',
      'work_order_file',
      'delivery_statement_file',
    ];

    const capitalDataObj = capitalData as Record<string, any>;

    for (const key of fileFields) {
      if (capitalDataObj[key]) {
        deleteFile(capitalDataObj[key]);
      }
    }
  }

  const [data] = await db.delete(capital)
    .where(eq(capital.uuid, uuid))
    .returning({
      name: capital.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    id: capital.id,
    capital_id: sql`CONCAT('CI', TO_CHAR(${capital.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${capital.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${capital.id}, 'FM0000'))`,
    index: capital.index,
    uuid: capital.uuid,
    sub_category_uuid: capital.sub_category_uuid,
    sub_category_name: sub_category.name,
    sub_category_type: sub_category.type,
    name: capital.name,
    is_quotation: capital.is_quotation,
    is_cs: capital.is_cs,
    cs_remarks: capital.cs_remarks,
    is_monthly_meeting: capital.is_monthly_meeting,
    monthly_meeting_remarks: capital.monthly_meeting_remarks,
    is_work_order: capital.is_work_order,
    work_order_remarks: capital.work_order_remarks,
    is_delivery_statement: capital.is_delivery_statement,
    delivery_statement_remarks: capital.delivery_statement_remarks,
    done: capital.done,
    created_at: capital.created_at,
    updated_at: capital.updated_at,
    created_by: capital.created_by,
    created_by_name: hrSchema.users.name,
    remarks: capital.remarks,
    // quotation_file: capital.quotation_file,
    // cs_file: capital.cs_file,
    // monthly_meeting_file: capital.monthly_meeting_file,
    work_order_file: capital.work_order_file,
    delivery_statement_file: capital.delivery_statement_file,
    quotation_date: capital.quotation_date,
    cs_date: capital.cs_date,
    monthly_meeting_date: capital.monthly_meeting_date,
    work_order_date: capital.work_order_date,
    delivery_statement_date: capital.delivery_statement_date,
    monthly_meeting_schedule_date: capital.monthly_meeting_schedule_date,
    done_date: capital.done_date,
    status: sql` CASE 
                    
                    WHEN ${capital.done} = true THEN 'Paid'
                    WHEN ${capital.sub_category_uuid} IS NOT NULL AND ${sub_category.type} = 'items' AND ${capital.is_work_order} = false THEN 'Decided'
                    WHEN ${capital.sub_category_uuid} IS NOT NULL AND ${sub_category.type} = 'items' AND ${capital.is_work_order} = true THEN 'Committed'
                    WHEN ${capital.is_quotation} = false THEN 'Requested'
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = false AND ${capital.is_monthly_meeting} = false  AND ${capital.is_work_order} = false THEN 'Pipeline' 
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = false AND ${capital.is_work_order} = false THEN 'Pipeline'
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = true AND ${capital.is_work_order} = false THEN 'Decided'
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = true AND ${capital.is_work_order} = true THEN 'Committed'
                  END`,
    value: sql` CASE 
                   
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = false AND ${capital.is_monthly_meeting} = false AND ${capital.is_work_order} = false THEN (
                        SELECT MIN(cv.amount)::float8 
                        FROM ${capital_vendor} cv 
                        WHERE cv.capital_uuid = ${capital.uuid}
                    )
                     WHEN ${capital.sub_category_uuid} IS NOT NULL AND ${sub_category.type} = 'items' THEN (
                        SELECT SUM(iwe.quantity::float8 * iwe.unit_price::float8)
                        FROM ${item_work_order_entry} iwe
                        LEFT JOIN ${capital} c ON c.uuid = iwe.capital_uuid
                        LEFT JOIN ${sub_category} sc ON sc.uuid = c.sub_category_uuid
                        WHERE sc.uuid = ${capital.sub_category_uuid} AND sc.type = 'items'
                    )
                    WHEN ${capital.is_quotation} = false THEN 0
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = false AND ${capital.is_work_order} = false THEN (
                        SELECT MIN(cv.amount)::float8 
                        FROM ${capital_vendor} cv 
                        WHERE cv.capital_uuid = ${capital.uuid}
                    )
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = true AND ${capital.is_work_order} = false THEN (
                        SELECT MIN(cv.amount)::float8 
                        FROM ${capital_vendor} cv 
                        WHERE cv.capital_uuid = ${capital.uuid}
                    )
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = true AND ${capital.is_work_order} = true THEN (
                        SELECT cv.amount::float8
                        FROM ${capital_vendor} cv 
                        WHERE cv.capital_uuid = ${capital.uuid} AND cv.vendor_uuid = ${capital.vendor_uuid}
                    )
                    END`,
  })
    .from(capital)
    .leftJoin(hrSchema.users, eq(capital.created_by, hrSchema.users.uuid))
    .leftJoin(sub_category, eq(capital.sub_category_uuid, sub_category.uuid))
    .leftJoin(capital_vendor, eq(capital_vendor.capital_uuid, capital.uuid))
    // .leftJoin(item_work_order_entry, eq(item_work_order_entry.capital_uuid, capital.uuid))
    .leftJoin(vendor, eq(capital.vendor_uuid, vendor.uuid))
    .groupBy(
      capital.id,
      capital.index,
      capital.uuid,
      sub_category.uuid,
      sub_category.name,
      sub_category.type,
      capital.name,
      capital.is_quotation,
      capital.is_cs,
      capital.cs_remarks,
      capital.is_monthly_meeting,
      capital.monthly_meeting_remarks,
      capital.is_work_order,
      capital.work_order_remarks,
      capital.is_delivery_statement,
      capital.delivery_statement_remarks,
      capital.done,
      capital.created_at,
      capital.updated_at,
      capital.created_by,
      hrSchema.users.name,
      capital.remarks,
    )
    .orderBy(desc(capital.created_at));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    index: capital.index,
    uuid: capital.uuid,
    vendor_uuid: capital.vendor_uuid,
    vendor_name: vendor.name,
    sub_category_uuid: capital.sub_category_uuid,
    sub_category_name: sub_category.name,
    sub_category_type: sub_category.type,
    name: capital.name,
    is_quotation: capital.is_quotation,
    is_cs: capital.is_cs,
    cs_remarks: capital.cs_remarks,
    is_monthly_meeting: capital.is_monthly_meeting,
    monthly_meeting_remarks: capital.monthly_meeting_remarks,
    is_work_order: capital.is_work_order,
    work_order_remarks: capital.work_order_remarks,
    is_delivery_statement: capital.is_delivery_statement,
    delivery_statement_remarks: capital.delivery_statement_remarks,
    done: capital.done,
    created_at: capital.created_at,
    updated_at: capital.updated_at,
    created_by: capital.created_by,
    created_by_name: hrSchema.users.name,
    remarks: capital.remarks,
    // quotation_file: capital.quotation_file,
    // cs_file: capital.cs_file,
    // monthly_meeting_file: capital.monthly_meeting_file,
    work_order_file: capital.work_order_file,
    delivery_statement_file: capital.delivery_statement_file,
    quotation_date: capital.quotation_date,
    cs_date: capital.cs_date,
    monthly_meeting_date: capital.monthly_meeting_date,
    work_order_date: capital.work_order_date,
    delivery_statement_date: capital.delivery_statement_date,
    monthly_meeting_schedule_date: capital.monthly_meeting_schedule_date,
    done_date: capital.done_date,
    quotations: sql`
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
              'uuid', capital_vendor.uuid,
              'capital_uuid', capital_vendor.capital_uuid,
              'capital_name', capital.name,
              'vendor_uuid', capital_vendor.vendor_uuid,
              'vendor_name', sv_vendor.name,
              'amount', capital_vendor.amount,
              'is_selected', capital_vendor.is_selected,
              'quotation_file', capital_vendor.quotation_file
            )
        ) FILTER (WHERE capital_vendor.uuid IS NOT NULL),
      '[]'::jsonb      
    )`,
    general_notes: sql`
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'uuid', gn.uuid,
            'capital_uuid', gn.capital_uuid,
            'capital_name', capital.name,
            'description', gn.description,
            'amount', gn.amount,
            'created_at', gn.created_at,
            'updated_at', gn.updated_at,
            'general_note_file', gn.general_note_file,
            'created_by', gn.created_by
          )
        )
        FROM procure.general_note gn
        WHERE gn.capital_uuid = capital.uuid
      ),
      '[]'::jsonb
    )
  `,
    status: sql` CASE 
                    
                    WHEN ${capital.done} = true THEN 'Paid'
                    WHEN ${capital.sub_category_uuid} IS NOT NULL AND ${sub_category.type} = 'items' AND ${capital.is_work_order} = false THEN 'Decided'
                    WHEN ${capital.sub_category_uuid} IS NOT NULL AND ${sub_category.type} = 'items' AND ${capital.is_work_order} = true THEN 'Committed'
                    WHEN ${capital.is_quotation} = false THEN 'Requested' 
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = false AND ${capital.is_monthly_meeting} = false AND ${capital.is_work_order} = false THEN 'Pipeline' 
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = false AND ${capital.is_work_order} = false THEN 'Pipeline'
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = true AND ${capital.is_work_order} = false THEN 'Decided'
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = true AND ${capital.is_work_order} = true THEN 'Committed'
                   
                  END`,
    value: sql` CASE 
                    
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = false AND ${capital.is_monthly_meeting} = false AND ${capital.is_work_order} = false THEN (
                        SELECT MIN(cv.amount)::float8  
                        FROM ${capital_vendor} cv 
                        WHERE cv.capital_uuid = ${capital.uuid}
                    )
                    WHEN ${capital.sub_category_uuid} IS NOT NULL AND ${sub_category.type} = 'items' THEN (
                        SELECT SUM(iwe.quantity::float8 * iwe.unit_price::float8)
                        FROM ${item_work_order_entry} iwe
                        LEFT JOIN ${capital} c ON c.uuid = iwe.capital_uuid
                        LEFT JOIN ${sub_category} sc ON sc.uuid = c.sub_category_uuid
                        WHERE sc.uuid = ${capital.sub_category_uuid} AND sc.type = 'items'
                    )
                    WHEN ${capital.is_quotation} = false THEN 0
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = false AND ${capital.is_work_order} = false THEN (
                        SELECT MIN(cv.amount)::float8  
                        FROM ${capital_vendor} cv 
                        WHERE cv.capital_uuid = ${capital.uuid}
                    )
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = true AND ${capital.is_work_order} = false THEN (
                        SELECT MIN(cv.amount)::float8  
                        FROM ${capital_vendor} cv 
                        WHERE cv.capital_uuid = ${capital.uuid}
                    )
                    WHEN ${capital.is_quotation} = true AND ${capital.is_cs} = true AND ${capital.is_monthly_meeting} = true AND ${capital.is_work_order} = true THEN (
                        SELECT cv.amount::float8 
                        FROM ${capital_vendor} cv 
                        WHERE cv.capital_uuid = ${capital.uuid} AND cv.vendor_uuid = ${capital.vendor_uuid}
                    )
                    END`,
    items: sql`
              COALESCE(
                (
                  SELECT jsonb_agg(
                    jsonb_build_object(
                        'uuid', iwe.uuid,
                        'capital_uuid', iwe.capital_uuid,
                        'item_uuid', iwe.item_uuid,
                        'item_name', i.name,
                        'quantity', iwe.quantity::float8,
                        'unit_price', iwe.unit_price::float8,
                        'is_received', iwe.is_received,
                        'created_at', iwe.created_at,
                        'updated_at', iwe.updated_at,
                        'created_by', iwe.created_by,
                        'created_by_name', hu.name,
                        'remarks', iwe.remarks,
                        'received_date', iwe.received_date
                    )
                  )
                  FROM procure.item_work_order_entry iwe
                  LEFT JOIN procure.item i ON iwe.item_uuid = i.uuid
                  LEFT JOIN hr.users hu ON iwe.created_by = hu.uuid
                  WHERE iwe.capital_uuid = capital.uuid
                ),
                '[]'::jsonb)`,
  })
    .from(capital)
    .leftJoin(hrSchema.users, eq(capital.created_by, hrSchema.users.uuid))
    .leftJoin(sub_category, eq(capital.sub_category_uuid, sub_category.uuid))
    .leftJoin(capital_vendor, eq(capital_vendor.capital_uuid, capital.uuid))
    .leftJoin(vendor, eq(capital.vendor_uuid, vendor.uuid))
    .leftJoin(sv_vendor, eq(capital_vendor.vendor_uuid, sv_vendor.uuid))
  // .leftJoin(item_work_order_entry, eq(item_work_order_entry.capital_uuid, capital.uuid))
    .where(eq(capital.uuid, uuid))
    .groupBy(
      capital.index,
      capital.uuid,
      vendor.uuid,
      sub_category.index,
      sub_category.uuid,
      capital.name,
      capital.is_quotation,
      capital.is_cs,
      capital.cs_remarks,
      capital.is_monthly_meeting,
      capital.monthly_meeting_remarks,
      capital.is_work_order,
      capital.work_order_remarks,
      capital.is_delivery_statement,
      capital.delivery_statement_remarks,
      capital.done,
      capital.created_at,
      capital.updated_at,
      capital.created_by,
      hrSchema.users.name,
      capital.remarks,
    );

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
