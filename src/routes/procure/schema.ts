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
  index: integer('index').default(sql`0`),
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

export const sub_purchase_cost_center = procure.table('sub_purchase_cost_center', {
  uuid: uuid_primary,
  index: integer('index').default(sql`0`),
  purchase_cost_center_uuid: defaultUUID('purchase_cost_center_uuid').references(() => purchase_cost_center.uuid, DEFAULT_OPERATION),
  name: text('name').notNull(),
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
  address: text('address').default(sql`null`),
  purpose: text('purpose').default(sql`null`),
  starting_date: DateTime('starting_date').default(sql`null`),
  ending_date: DateTime('ending_date').default(sql`null`),
  product_type: text('product_type').default(sql`null`),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const capital = procure.table('capital', {
  uuid: uuid_primary,
  index: integer('index').default(0),
  sub_category_uuid: defaultUUID('sub_category_uuid').references(() => sub_category.uuid, DEFAULT_OPERATION),
  vendor_uuid: defaultUUID('vendor_uuid').references(() => vendor.uuid, DEFAULT_OPERATION).default(sql`null`),
  name: text('name').notNull(),
  is_quotation: boolean('is_quotation').notNull().default(false),
  is_cs: boolean('is_cs').notNull().default(false),
  cs_remarks: text('cs_remarks').default(sql`null`),
  is_monthly_meeting: boolean('is_monthly_meeting').notNull().default(false),
  monthly_meeting_remarks: text('monthly_meeting_remarks').default(sql`null`),
  is_work_order: boolean('is_work_order').notNull().default(false),
  work_order_remarks: text('work_order_remarks').default(sql`null`),
  is_delivery_statement: boolean('is_delivery_statement').notNull().default(false),
  delivery_statement_remarks: text('delivery_statement_remarks').default(sql`null`),
  done: boolean('done').notNull().default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
  id: integer('id'),
});

export const item_index = procure.sequence('item_index', DEFAULT_SEQUENCE);

export const item = procure.table('item', {
  uuid: uuid_primary,
  index: integer('index').default(sql`nextval('procure.item_index')`),
  purchase_cost_center_uuid: defaultUUID('purchase_cost_center_uuid').references(() => purchase_cost_center.uuid, DEFAULT_OPERATION),
  name: text('name').notNull(),
  quantity: PG_DECIMAL('quantity').default(sql`0`),
  vendor_price: PG_DECIMAL('vendor_price').default(sql`0`),
  price_validity: DateTime('price_validity'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
  unit: text('unit').default(sql`null`),
  sub_purchase_cost_center_uuid: defaultUUID('sub_purchase_cost_center_uuid').references(() => sub_purchase_cost_center.uuid, DEFAULT_OPERATION),
});

export const general_note = procure.table('general_note', {
  uuid: uuid_primary,
  capital_uuid: defaultUUID('capital_uuid').references(() => capital.uuid, DEFAULT_OPERATION),
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

export const capital_vendor = procure.table('capital_vendor', {
  uuid: uuid_primary,
  capital_uuid: defaultUUID('capital_uuid').references(() => capital.uuid, DEFAULT_OPERATION),
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
  id: integer('id'),
});

export const item_work_order_entry = procure.table('item_work_order_entry', {
  uuid: uuid_primary,
  item_uuid: defaultUUID('item_uuid').references(() => item.uuid, DEFAULT_OPERATION),
  quantity: PG_DECIMAL('quantity').default(sql`0`),
  unit_price: PG_DECIMAL('unit_price').default(sql`0`),
  is_received: boolean('is_received').notNull().default(false),
  received_date: DateTime('received_date').default(sql`null`),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
  capital_uuid: defaultUUID('capital_uuid').references(() => capital.uuid, DEFAULT_OPERATION),

});

export const service_id = procure.sequence('service_id', DEFAULT_SEQUENCE);

export const service_frequency = procure.enum('service_frequency', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
export const service_payment_terms = procure.enum('service_payment_terms', ['prepaid', 'postpaid', 'upon_completion']);
export const service_status = procure.enum('service_status', ['active', 'pending', 'expired', 'suspended']);

export const service = procure.table('service', {
  id: integer('id'),
  uuid: uuid_primary,
  sub_category_uuid: defaultUUID('sub_category_uuid').references(() => sub_category.uuid, DEFAULT_OPERATION).notNull(),
  vendor_uuid: defaultUUID('vendor_uuid').references(() => vendor.uuid, DEFAULT_OPERATION).notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  frequency: service_frequency('frequency'),
  start_date: DateTime('start_date'),
  end_date: DateTime('end_date'),
  cost_per_service: PG_DECIMAL('cost_per_service').default(sql`0`),
  payment_terms: service_payment_terms('payment_terms'),
  status: service_status('status').notNull().default('active'),
  approval_required: boolean('approval_required').notNull().default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const service_payment = procure.table('service_payment', {
  uuid: uuid_primary,
  service_uuid: defaultUUID('service_uuid').references(() => service.uuid, DEFAULT_OPERATION).notNull(),
  amount: PG_DECIMAL('amount').default(sql`0`),
  payment_date: DateTime('payment_date'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
  next_due_date: DateTime('next_due_date'),
});

export const form = procure.table('form', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  file: text('file').notNull(),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const internal_cost_center_department = procure.enum('internal_cost_center_department', ['chairman_bot', 'vice_chancellor', 'treasurer', 'pni', 'pnd', 'civil_engineering', 'admission_office', 'controller_office', 'exam_c_01', 'exam_c_02', 'account_c_01', 'account_c_02', 'cse', 'registrar(hod)', 'additional_registrar', 'additional_registrar_c_01', 'additional_registrar_c_02', 'english', 'business_administration', 'library ', 'ipe_&_iqac', 'textile_engineering', 'proctor_office', 'eee', 'fde', 'medical_centre', 'economics', 'mdgs', 'thm', 'mathematics ', 'pcu', 'program_coordination_manager', 'program_coordination_asst_manager', 'sr_program_coordination_incharge', 'physics', 'chemistry', 'security_director', 'logistics', 'reception_gate', 'ict', 'law']);

export const internal_cost_center = procure.table('internal_cost_center', {
  uuid: uuid_primary,
  authorized_person_uuid: defaultUUID('authorized_person_uuid').references(() => users.uuid, DEFAULT_OPERATION),
  name: text('name').notNull(),
  from: DateTime('from').notNull(),
  to: DateTime('to').notNull(),
  budget: PG_DECIMAL('budget').default(sql`0`),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
  can_submitted_person_uuid: defaultUUID('can_submitted_person_uuid').references(() => users.uuid, DEFAULT_OPERATION),
  department: internal_cost_center_department('department').notNull(),
});

export const requisition_id = procure.sequence('requisition_id', DEFAULT_SEQUENCE);

export const requisition = procure.table('requisition', {
  id: integer('id'),
  uuid: uuid_primary,
  is_received: boolean('is_received').default(false),
  received_date: DateTime('received_date').default(sql`null`),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
  is_store_received: boolean('is_store_received').default(false),
  store_received_date: DateTime('store_received_date').default(sql`null`),
  pi_generated_number: integer('pi_generated_number').default(sql`0`),
});

export const requisition_log_id = procure.sequence('requisition_log_id', DEFAULT_SEQUENCE);

export const requisition_log = procure.table('requisition_log', {
  id: integer('id').default(sql`nextval('procure.requisition_log_id')`),
  requisition_uuid: defaultUUID('requisition_uuid').references(() => requisition.uuid, DEFAULT_OPERATION),
  is_received: boolean('is_received').default(false),
  received_date: DateTime('received_date').default(sql`null`),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
});

export const item_requisition = procure.table('item_requisition', {
  uuid: uuid_primary,
  requisition_uuid: defaultUUID('requisition_uuid').references(() => requisition.uuid, DEFAULT_OPERATION),
  item_uuid: defaultUUID('item_uuid').references(() => item.uuid, DEFAULT_OPERATION),
  req_quantity: PG_DECIMAL('req_quantity').default(sql`0`),
  provided_quantity: PG_DECIMAL('provided_quantity').default(sql`0`),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const item_transfer_id = procure.sequence('item_transfer_id', DEFAULT_SEQUENCE);
export const item_transfer_reason = procure.enum('item_transfer_reason', ['emergency']);

export const item_transfer = procure.table('item_transfer', {
  uuid: uuid_primary,
  id: integer('id').default(sql`nextval('procure.item_transfer_id')`),
  item_uuid: defaultUUID('item_uuid').references(() => item.uuid, DEFAULT_OPERATION),
  quantity: PG_DECIMAL('quantity').default(sql`0`),
  reason: item_transfer_reason('reason').notNull().default('emergency'),
  is_requisition_received: boolean('is_requisition_received').default(false),
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

export const procure_sub_purchase_cost_center_rel = relations (sub_purchase_cost_center, ({ one }) => ({
  created_by: one(users, {
    fields: [sub_purchase_cost_center.created_by],
    references: [users.uuid],
  }),
  purchase_cost_center: one(purchase_cost_center, {
    fields: [sub_purchase_cost_center.purchase_cost_center_uuid],
    references: [purchase_cost_center.uuid],
  }),
}));

export const procure_capital_rel = relations (capital, ({ one }) => ({
  created_by: one(users, {
    fields: [capital.created_by],
    references: [users.uuid],
  }),
  sub_category: one(sub_category, {
    fields: [capital.sub_category_uuid],
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
  capital: one(capital, {
    fields: [general_note.capital_uuid],
    references: [capital.uuid],
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

export const procure_capital_vendor_rel = relations (capital_vendor, ({ one }) => ({
  created_by: one(users, {
    fields: [capital_vendor.created_by],
    references: [users.uuid],
  }),
  capital: one(capital, {
    fields: [capital_vendor.capital_uuid],
    references: [capital.uuid],
  }),
  vendor: one(vendor, {
    fields: [capital_vendor.vendor_uuid],
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
}));

export const procure_service_rel = relations (service, ({ one, many }) => ({
  created_by: one(users, {
    fields: [service.created_by],
    references: [users.uuid],
  }),
  sub_category: one(sub_category, {
    fields: [service.sub_category_uuid],
    references: [sub_category.uuid],
  }),
  vendor: one(vendor, {
    fields: [service.vendor_uuid],
    references: [vendor.uuid],
  }),
  service_payment: many(service_payment),
}));

export const procure_service_payment_rel = relations (service_payment, ({ one }) => ({
  created_by: one(users, {
    fields: [service_payment.created_by],
    references: [users.uuid],
  }),
  service: one(service, {
    fields: [service_payment.service_uuid],
    references: [service.uuid],
  }),
}));

export const procure_form_rel = relations (form, ({ one }) => ({
  created_by: one(users, {
    fields: [form.created_by],
    references: [users.uuid],
  }),
}));

export const procure_internal_cost_center_rel = relations (internal_cost_center, ({ one }) => ({
  created_by: one(users, {
    fields: [internal_cost_center.created_by],
    references: [users.uuid],
  }),
  authorized_person: one(users, {
    fields: [internal_cost_center.authorized_person_uuid],
    references: [users.uuid],
  }),
  can_submitted_person: one(users, {
    fields: [internal_cost_center.can_submitted_person_uuid],
    references: [users.uuid],
  }),
}));

export const procure_requisition_rel = relations (requisition, ({ one }) => ({
  created_by: one(users, {
    fields: [requisition.created_by],
    references: [users.uuid],
  }),
}));

export const procure_item_requisition_rel = relations (item_requisition, ({ one }) => ({
  created_by: one(users, {
    fields: [item_requisition.created_by],
    references: [users.uuid],
  }),
  requisition: one(requisition, {
    fields: [item_requisition.requisition_uuid],
    references: [requisition.uuid],
  }),
  item: one(item, {
    fields: [item_requisition.item_uuid],
    references: [item.uuid],
  }),
}));

export const procure_item_transfer_rel = relations (item_transfer, ({ one }) => ({
  created_by: one(users, {
    fields: [item_transfer.created_by],
    references: [users.uuid],
  }),
  item: one(item, {
    fields: [item_transfer.item_uuid],
    references: [item.uuid],
  }),
}));

export default procure;
