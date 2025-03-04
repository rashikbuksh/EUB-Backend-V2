import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { item_vendor } from '../schema';

//* crud
export const selectSchema = createSelectSchema(item_vendor);

export const insertSchema = createInsertSchema(
  item_vendor,
  {
    uuid: schema => schema.uuid.length(21),
    item_uuid: schema => schema.item_uuid.length(21),
    vendor_uuid: schema => schema.vendor_uuid.length(21),
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
  item_uuid: true,
  vendor_uuid: true,
  created_at: true,
  created_by: true,
}).partial({
  is_active: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
