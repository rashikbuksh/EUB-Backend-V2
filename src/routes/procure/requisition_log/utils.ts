import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { requisition_log } from '../schema';

//* crud
export const selectSchema = createSelectSchema(requisition_log);

export const insertSchema = createInsertSchema(
  requisition_log,
  {
    is_received: schema => schema.is_received,
    received_date: schema => schema.received_date,
    requisition_uuid: schema => schema.requisition_uuid.length(36),
    created_by: schema => schema.created_by.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  is_received: true,
  received_date: true,
  created_at: true,
  created_by: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
