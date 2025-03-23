import { relations, sql } from 'drizzle-orm';
import { boolean, integer, pgSchema, text } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, PG_DECIMAL, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION, DEFAULT_SEQUENCE } from '@/utils/db';

import { users } from '../hr/schema';

const procure = pgSchema('procure');

export const category_name = procure.enum('category_name', ['recurring', 'capital']);

export const category = procure.table('category', {
  uuid: uuid_primary,
  index: integer('index').notNull().unique(),
  name: category_name('name').notNull(),
  is_capital: boolean('is_capital').notNull().default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),

});

export const sub_category_type = procure.enum('sub_category_type', ['items', 'services', 'range_1', 'range_2', 'range_3', 'range_4']);

export const sub_category = procure.table('sub_category', {
  uuid: uuid_primary,
  index: integer('index').notNull().unique(),
  category_uuid: defaultUUID('category_uuid').references(() => category.uuid, DEFAULT_OPERATION),
  type: sub_category_type('type').notNull(),
  name: text('name').notNull(),
  min_amount: PG_DECIMAL('min_amount').default(sql`0`),
  min_quotation: PG_DECIMAL('min_quotation').default(sql`0`),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const process_name = procure.enum('process_name', ['quotation', 'comparative_study', 'monthly_meeting', 'work_order', 'delivery_statement']);

export const process = procure.table('process', {
  uuid: uuid_primary,
  index: integer('index').notNull().unique(),
  name: process_name('name').notNull(),
  short_name: text('short_name').notNull(),
  items: boolean('items').notNull().default(false),
  service: boolean('service').notNull().default(false),
  range_1: boolean('range_1').notNull().default(false),
  range_2: boolean('range_2').notNull().default(false),
  range_3: boolean('range_3').notNull().default(false),
  range_4: boolean('range_4').notNull().default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const purchase_cost_center = procure.table('purchase_cost_center', {
  uuid: uuid_primary,
  index: integer('index').notNull().unique(),
  sub_category_uuid: defaultUUID('sub_category_uuid').references(() => sub_category.uuid, DEFAULT_OPERATION),
  name: text('name').notNull(),
  from: DateTime('from').notNull(),
  to: DateTime('to').notNull(),
  budget: PG_DECIMAL('budget').default(sql`0`),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const vendor_id = procure.sequence('vendor_id', DEFAULT_SEQUENCE);

export const vendor = procure.table('vendor', {
  uuid: uuid_primary,
  id: integer('id').default(sql`nextval('procure.vendor_id')`),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const service = procure.table('service', {
  uuid: uuid_primary,
  index: integer('index').default(0),
  sub_category_uuid: defaultUUID('sub_category_uuid').references(() => sub_category.uuid, DEFAULT_OPERATION),
  vendor_uuid: defaultUUID('vendor_uuid').references(() => vendor.uuid, DEFAULT_OPERATION).default(sql`null`),
  name: text('name').notNull(),
  is_quotation: boolean('is_quotation').notNull().default(false),
  is_cs: boolean('is_cs').notNull().default(false),
  cs_remarks: text('cs_remarks').notNull(),
  is_monthly_meeting: boolean('is_monthly_meeting').notNull().default(false),
  monthly_meeting_remarks: text('monthly_meeting_remarks').notNull(),
  is_work_order: boolean('is_work_order').notNull().default(false),
  work_order_remarks: text('work_order_remarks').notNull(),
  is_delivery_statement: boolean('is_delivery_statement').notNull().default(false),
  delivery_statement_remarks: text('delivery_statement_remarks').notNull(),
  done: boolean('done').notNull().default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const item = procure.table('item', {
  uuid: uuid_primary,
  index: integer('index').notNull().unique(),
  purchase_cost_center_uuid: defaultUUID('purchase_cost_center_uuid').references(() => purchase_cost_center.uuid, DEFAULT_OPERATION),
  name: text('name').notNull(),
  quantity: PG_DECIMAL('quantity').default(sql`0`),
  vendor_price: PG_DECIMAL('vendor_price').default(sql`0`),
  price_validity: DateTime('price_validity').notNull(),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const general_note = procure.table('general_note', {
  uuid: uuid_primary,
  service_uuid: defaultUUID('service_uuid').references(() => service.uuid, DEFAULT_OPERATION),
  description: text('description').notNull(),
  amount: PG_DECIMAL('amount').default(sql`0`),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const item_vendor = procure.table('item_vendor', {
  uuid: uuid_primary,
  item_uuid: defaultUUID('item_uuid').references(() => item.uuid, DEFAULT_OPERATION),
  vendor_uuid: defaultUUID('vendor_uuid').references(() => vendor.uuid, DEFAULT_OPERATION),
  is_active: boolean('is_active').notNull().default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const service_vendor = procure.table('service_vendor', {
  uuid: uuid_primary,
  service_uuid: defaultUUID('service_uuid').references(() => service.uuid, DEFAULT_OPERATION),
  vendor_uuid: defaultUUID('vendor_uuid').references(() => vendor.uuid, DEFAULT_OPERATION),
  amount: PG_DECIMAL('amount').default(sql`0`),
  is_selected: boolean('is_selected').notNull().default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const item_work_order_status = procure.enum('item_work_order_status', ['pending', 'accept', 'rejected']);

export const item_work_order = procure.table('item_work_order', {
  uuid: uuid_primary,
  vendor_uuid: defaultUUID('vendor_uuid').references(() => vendor.uuid, DEFAULT_OPERATION),
  status: item_work_order_status('status').default('pending'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const item_work_order_entry = procure.table('item_work_order_entry', {
  uuid: uuid_primary,
  item_work_order_uuid: defaultUUID('item_work_order_uuid').references(() => item_work_order.uuid, DEFAULT_OPERATION),
  item_uuid: defaultUUID('item_uuid').references(() => item.uuid, DEFAULT_OPERATION),
  quantity: PG_DECIMAL('quantity').default(sql`0`),
  unit_price: PG_DECIMAL('unit_price').default(sql`0`),
  is_received: boolean('is_received').notNull().default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

//* Relations *//

export const procure_category_rel = relations (category, ({ one }) => ({
  created_by: one(users, {
    fields: [category.created_by],
    references: [users.uuid],
  }),
}));

export const procure_sub_category_rel = relations (sub_category, ({ one }) => ({
  created_by: one(users, {
    fields: [sub_category.created_by],
    references: [users.uuid],
  }),
  category: one(category, {
    fields: [sub_category.category_uuid],
    references: [category.uuid],
  }),
}));

export const procure_process_rel = relations (process, ({ one }) => ({
  created_by: one(users, {
    fields: [process.created_by],
    references: [users.uuid],
  }),
}));

export const procure_purchase_cost_center_rel = relations (purchase_cost_center, ({ one }) => ({
  created_by: one(users, {
    fields: [purchase_cost_center.created_by],
    references: [users.uuid],
  }),
  sub_category: one(sub_category, {
    fields: [purchase_cost_center.sub_category_uuid],
    references: [sub_category.uuid],
  }),
}));

export const procure_service_rel = relations (service, ({ one }) => ({
  created_by: one(users, {
    fields: [service.created_by],
    references: [users.uuid],
  }),
  sub_category: one(sub_category, {
    fields: [service.sub_category_uuid],
    references: [sub_category.uuid],
  }),
}));

export const procure_item_rel = relations (item, ({ one, many }) => ({
  vendors: many(item_vendor),
  created_by: one(users, {
    fields: [item.created_by],
    references: [users.uuid],
  }),
  purchase_cost_center: one(purchase_cost_center, {
    fields: [item.purchase_cost_center_uuid],
    references: [purchase_cost_center.uuid],
  }),
}));

export const procure_vendor_rel = relations (vendor, ({ one }) => ({
  created_by: one(users, {
    fields: [vendor.created_by],
    references: [users.uuid],
  }),
}));

export const procure_general_note_rel = relations (general_note, ({ one }) => ({
  created_by: one(users, {
    fields: [general_note.created_by],
    references: [users.uuid],
  }),
  service: one(service, {
    fields: [general_note.service_uuid],
    references: [service.uuid],
  }),
}));

export const procure_item_vendor_rel = relations (item_vendor, ({ one }) => ({
  created_by: one(users, {
    fields: [item_vendor.created_by],
    references: [users.uuid],
  }),
  item: one(item, {
    fields: [item_vendor.item_uuid],
    references: [item.uuid],
  }),
  vendor: one(vendor, {
    fields: [item_vendor.vendor_uuid],
    references: [vendor.uuid],
  }),
}));

export const procure_service_vendor_rel = relations (service_vendor, ({ one }) => ({
  created_by: one(users, {
    fields: [service_vendor.created_by],
    references: [users.uuid],
  }),
  service: one(service, {
    fields: [service_vendor.service_uuid],
    references: [service.uuid],
  }),
  vendor: one(vendor, {
    fields: [service_vendor.vendor_uuid],
    references: [vendor.uuid],
  }),
}));

export const procure_item_work_order_rel = relations (item_work_order, ({ one, many }) => ({
  item_work_order_entry: many(item_work_order_entry),
  created_by: one(users, {
    fields: [item_work_order.created_by],
    references: [users.uuid],
  }),
  vendor: one(vendor, {
    fields: [item_work_order.vendor_uuid],
    references: [vendor.uuid],
  }),
}));

export const procure_item_work_order_entry_rel = relations (item_work_order_entry, ({ one }) => ({
  created_by: one(users, {
    fields: [item_work_order_entry.created_by],
    references: [users.uuid],
  }),
  item: one(item, {
    fields: [item_work_order_entry.item_uuid],
    references: [item.uuid],
  }),
  item_work_order: one(item_work_order, {
    fields: [item_work_order_entry.item_work_order_uuid],
    references: [item_work_order.uuid],
  }),
}));

export default procure;
