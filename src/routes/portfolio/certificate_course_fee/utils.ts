import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { dateTimePattern } from '@/utils';

import { certificate_course_fee } from '../schema';

//* crud

export const selectSchema = createSelectSchema(certificate_course_fee);

export const insertSchema = createInsertSchema(
  certificate_course_fee,
  {
    uuid: schema => schema.uuid.length(21),
    programs_uuid: schema => schema.programs_uuid.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    fee_per_course: z.number().min(0).optional(),
  },
).required({
  uuid: true,
  programs_uuid: true,
  created_at: true,
}).partial({
  fee_per_course: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
