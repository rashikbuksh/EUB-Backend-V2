import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { dateTimePattern } from '@/utils';

import { item_transfer } from '../schema';

//* crud
export const selectSchema = createSelectSchema(item_transfer);

export const insertSchema = createInsertSchema(
  item_transfer,
  {
    uuid: schema => schema.uuid.length(21),
    item_uuid: schema => schema.item_uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    quantity: z.number().optional().default(0),

  },
).required({
  uuid: true,
  item_uuid: true,
  created_at: true,
  created_by: true,
}).partial({
  quantity: true,
  reason: true,
  is_requisition_received: true,
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
