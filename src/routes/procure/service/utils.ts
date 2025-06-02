import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { dateTimePattern } from '@/utils';

import { service } from '../schema';

//* crud
export const selectSchema = createSelectSchema(service);

export const insertSchema = createInsertSchema(
  service,
  {
    uuid: schema => schema.uuid.length(21),
    sub_category_uuid: schema => schema.sub_category_uuid.length(21),
    vendor_uuid: schema => schema.vendor_uuid.length(21),
    cost_per_service: z.number().optional(),
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
  vendor_uuid: true,
  name: true,
  description: true,
  frequency: true,
  start_date: true,
  end_date: true,
  payment_terms: true,
  status: true,
  approval_required: true,
  created_at: true,
  created_by: true,
}).partial({
  id: true,
  sub_category_uuid: true,
  cost_per_service: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
