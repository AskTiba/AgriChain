import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const harvestEntries = pgTable('harvest_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  cropType: text('crop_type').notNull(),
  qualityGrade: text('quality_grade').notNull(),
  quantity: integer('quantity').notNull(),
  fieldId: text('field_id').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
})

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  harvestId: uuid('harvest_id').references(() => harvestEntries.id),
  buyerId: text('buyer_id').notNull(),
  quantity: integer('quantity').notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'delivered'] })
    .notNull()
    .default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: ['truck', 'pickup', 'motorcycle', 'other'] })
    .notNull()
    .default('truck'),
  plateNumber: text('plate_number'),
  payloadCapacity: integer('payload_capacity').notNull(),
  status: text('status', { enum: ['available', 'in-use', 'maintenance'] })
    .notNull()
    .default('available'),
})

export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  harvestId: uuid('harvest_id').references(() => harvestEntries.id),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id),
  driverName: text('driver_name').notNull(),
  destination: text('destination').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type HarvestEntry = typeof harvestEntries.$inferSelect
export type NewHarvestEntry = typeof harvestEntries.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type Vehicle = typeof vehicles.$inferSelect
export type NewVehicle = typeof vehicles.$inferInsert
export type Assignment = typeof assignments.$inferSelect
export type NewAssignment = typeof assignments.$inferInsert
