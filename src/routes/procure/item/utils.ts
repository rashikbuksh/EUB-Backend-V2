import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { item } from '../schema';

//* crud
export const selectSchema = createSelectSchema(item);

export const insertSchema = createInsertSchema(
  item,
  {
    uuid: schema => schema.uuid.length(21),
    purchase_cost_center_uuid: schema => schema.purchase_cost_center_uuid.length(21),
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
  purchase_cost_center_uuid: true,
  index: true,
  name: true,
  price_validity: true,
  created_at: true,
  created_by: true,
}).partial({
  vendor_price: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
