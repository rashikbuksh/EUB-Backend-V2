import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { dateTimePattern } from '@/utils';

import { tuition_fee } from '../schema';

//* crud

export const selectSchema = createSelectSchema(tuition_fee);

export const insertSchema = createInsertSchema(
  tuition_fee,
  {
    uuid: schema => schema.uuid.length(21),
    title: schema => schema.title.min(4),
    program_uuid: schema => schema.program_uuid.length(21),
    admission_fee: z.number().positive(),
    tuition_fee_per_credit: z.number().positive(),
    student_activity_fee: z.number().positive(),
    library_fee_per_semester: z.number().positive(),
    computer_lab_fee_per_semester: z.number().positive(),
    science_lab_fee_per_semester: z.number().positive(),
    studio_lab_fee: z.number().optional(),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  program_uuid: true,
  admission_fee: true,
  tuition_fee_per_credit: true,
  student_activity_fee: true,
  library_fee_per_semester: true,
  computer_lab_fee_per_semester: true,
  science_lab_fee_per_semester: true,
  created_at: true,
}).partial({
  title: true,
  studio_lab_fee: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
