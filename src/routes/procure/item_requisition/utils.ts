import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { dateTimePattern } from '@/utils';

import { item_requisition } from '../schema';

//* crud
export const selectSchema = createSelectSchema(item_requisition);

export const insertSchema = createInsertSchema(
  item_requisition,
  {
    uuid: schema => schema.uuid.length(21),
    item_uuid: schema => schema.item_uuid.length(21),
    requisition_uuid: schema => schema.requisition_uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    req_quantity: z.number().optional().default(0),
    provided_quantity: z.number().optional().default(0),

  },
).required({
  uuid: true,
  item_uuid: true,
  requisition_uuid: true,
  created_at: true,
  created_by: true,
}).partial({
  req_quantity: true,
  provided_quantity: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
