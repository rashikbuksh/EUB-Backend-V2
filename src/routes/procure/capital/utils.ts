import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { capital } from '../schema';

//* crud
export const selectSchema = createSelectSchema(capital);

export const insertSchema = createInsertSchema(
  capital,
  {
    uuid: schema => schema.uuid.length(21),
    sub_category_uuid: schema => schema.sub_category_uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  name: true,
  created_at: true,
  created_by: true,
  monthly_meeting_schedule_date: true,
}).partial({
  index: true,
  is_quotation: true,
  is_cs: true,
  cs_remarks: true,
  is_monthly_meeting: true,
  monthly_meeting_remarks: true,
  is_work_order: true,
  work_order_remarks: true,
  is_delivery_statement: true,
  delivery_statement_remarks: true,
  done: true,
  updated_at: true,
  remarks: true,
  quotation_file: true,
  cs_file: true,
  monthly_meeting_file: true,
  work_order_file: true,
  delivery_statement_file: true,
  quotation_date: true,
  cs_date: true,
  monthly_meeting_date: true,
  work_order_date: true,
  delivery_statement_date: true,
  done_date: true,
});

export const patchSchema = insertSchema.partial();
