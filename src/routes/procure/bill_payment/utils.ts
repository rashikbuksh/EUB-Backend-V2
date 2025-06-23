import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { dateTimePattern } from '@/utils';

import { bill_payment } from '../schema';

//* crud
export const selectSchema = createSelectSchema(bill_payment);

export const insertSchema = createInsertSchema(
  bill_payment,
  {
    uuid: schema => schema.uuid.length(21),
    bill_uuid: schema => schema.bill_uuid.length(21),
    amount: z.number().positive(),
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
  bill_uuid: true,
  amount: true,
  created_at: true,
  created_by: true,
}).partial({
  type: true,
  updated_at: true,
  remarks: true,
  payment_method: true,
  payment_date: true,
});

export const patchSchema = insertSchema.partial();
