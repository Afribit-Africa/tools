import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const validationSessions = pgTable('validation_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileName: text('file_name').notNull(),
  totalAddresses: integer('total_addresses').notNull(),
  validCount: integer('valid_count').default(0).notNull(),
  invalidCount: integer('invalid_count').default(0).notNull(),
  fixedCount: integer('fixed_count').default(0).notNull(),
  status: text('status').notNull().$type<'processing' | 'completed' | 'failed'>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const addressValidations = pgTable('address_validations', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => validationSessions.id, { onDelete: 'cascade' })
    .notNull(),
  originalAddress: text('original_address').notNull(),
  cleanedAddress: text('cleaned_address'),
  status: text('status').notNull().$type<'valid' | 'invalid' | 'fixed'>(),
  errorMessage: text('error_message'),
  validatedAt: timestamp('validated_at').defaultNow().notNull(),
});

export type ValidationSession = typeof validationSessions.$inferSelect;
export type NewValidationSession = typeof validationSessions.$inferInsert;
export type AddressValidation = typeof addressValidations.$inferSelect;
export type NewAddressValidation = typeof addressValidations.$inferInsert;
