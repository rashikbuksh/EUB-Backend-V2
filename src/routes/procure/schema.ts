import { pgSchema } from 'drizzle-orm/pg-core';

const procure = pgSchema('procure');

export const category_name = procure.enum('category_name', ['recurring', 'capital']);
