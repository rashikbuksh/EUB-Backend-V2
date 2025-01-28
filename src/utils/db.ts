import type { UpdateDeleteAction } from 'drizzle-orm/pg-core';

interface Operation { onDelete: UpdateDeleteAction; onUpdate: UpdateDeleteAction }

export const DEFAULT_OPERATION: Operation = { onDelete: 'set null', onUpdate: 'cascade' };

export const DEFAULT_SEQUENCE = {
  startWith: 1,
  increment: 1,
};
