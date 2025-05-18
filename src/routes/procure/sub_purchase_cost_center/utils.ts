import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { sub_purchase_cost_center } from '../schema';

//* crud
export const selectSchema = createSelectSchema(sub_purchase_cost_center);

export const insertSchema = createInsertSchema(
  sub_purchase_cost_center,
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
  index: true,
  name: true,
  purchase_cost_center_uuid: true,
  created_at: true,
  created_by: true,
}).partial({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
