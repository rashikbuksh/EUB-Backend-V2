import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
// import { z } from 'zod';

import { dateTimePattern } from '@/utils';

import { bill } from '../schema';

//* crud
export const selectSchema = createSelectSchema(bill);

export const insertSchema = createInsertSchema(
  bill,
  {
    uuid: schema => schema.uuid.length(21),
    vendor_uuid: schema => schema.vendor_uuid.length(21),
    bank_uuid: schema => schema.bank_uuid.length(21),
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
  created_at: true,
  created_by: true,
}).partial({
  vendor_uuid: true,
  bank_uuid: true,
  updated_at: true,
  remarks: true,
  is_completed: true,
  completed_date: true,
});

export const patchSchema = insertSchema.partial();
