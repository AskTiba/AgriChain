import { pgTable, uuid, text, integer, boolean, timestamp, varchar } from 'drizzle-orm/pg-core'

export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  totalCapacityKg: integer('total_capacity_kg').notNull(),
  cooperativeId: uuid('cooperative_id').references(() => cooperatives.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const harvestEntries = pgTable('harvest_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  cropType: text('crop_type').notNull(),
  qualityGrade: text('quality_grade').notNull(),
  quantity: integer('quantity').notNull(),
  fieldId: text('field_id').notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
})

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  harvestId: uuid('harvest_id').references(() => harvestEntries.id),
  buyerId: uuid('buyer_id').references(() => users.id),
  quantity: integer('quantity').notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'in-transit', 'delivered'] })
    .notNull()
    .default('pending'),
  confirmedBy: uuid('confirmed_by').references(() => users.id),
  assignedDriverId: uuid('assigned_driver_id').references(() => users.id),
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

export const cooperatives = pgTable('cooperatives', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'manager', 'driver', 'buyer'] })
    .notNull()
    .default('buyer'),
  cooperativeId: uuid('cooperative_id').references(() => cooperatives.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type', { enum: ['order_placed', 'order_confirmed', 'driver_assigned', 'status_changed'] }).notNull(),
  message: text('message').notNull(),
  orderId: uuid('order_id').references(() => orders.id),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type SafeUser = Omit<User, 'passwordHash' | 'createdAt'>
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
export type Cooperative = typeof cooperatives.$inferSelect
export type NewCooperative = typeof cooperatives.$inferInsert
export type Warehouse = typeof warehouses.$inferSelect
export type NewWarehouse = typeof warehouses.$inferInsert
