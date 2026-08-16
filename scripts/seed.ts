import 'dotenv/config'
import { getDb } from '../src/app/db'
import {
  harvestEntries, orders, users, cooperatives,
  vehicles, assignments, notifications, warehouses,
} from '../src/app/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const PASSWORD_HASH_CACHE = new Map<string, string>()
async function hash(pw: string) {
  if (!PASSWORD_HASH_CACHE.has(pw)) {
    PASSWORD_HASH_CACHE.set(pw, await bcrypt.hash(pw, 12))
  }
  return PASSWORD_HASH_CACHE.get(pw)!
}

async function seed() {
  const db = getDb()
  console.log('Seeding test database...')

  // Clean in FK order
  await db.delete(notifications)
  await db.delete(assignments)
  await db.delete(orders)
  await db.delete(harvestEntries)
  await db.delete(warehouses)
  await db.delete(users)
  await db.delete(vehicles)
  await db.delete(cooperatives)

  const pw = await hash('password123')

  // ── Cooperatives ──
  const [greenValley, easternHighlands] = await db.insert(cooperatives).values([
    { name: 'Green Valley Farmers Co-op', location: 'Western Province', createdBy: null },
    { name: 'Eastern Highlands Growers', location: 'Eastern Province', createdBy: null },
  ]).returning()
  console.log('  ✓ 2 cooperatives')

  // ── Users ──
  const [
    admin, manager1, manager2, driver1, driver2, buyer1, buyer2, unassigned,
  ] = await db.insert(users).values([
    { email: 'admin@coop.com', name: 'Platform Admin', passwordHash: pw, role: 'admin', cooperativeId: null },
    { email: 'manager@greenvalley.com', name: 'Sarah Manager', passwordHash: pw, role: 'manager', cooperativeId: greenValley.id },
    { email: 'manager2@greenvalley.com', name: 'James Foreman', passwordHash: pw, role: 'manager', cooperativeId: greenValley.id },
    { email: 'driver1@greenvalley.com', name: 'David Driver', passwordHash: pw, role: 'driver', cooperativeId: greenValley.id },
    { email: 'driver2@greenvalley.com', name: 'Grace Njeri', passwordHash: pw, role: 'driver', cooperativeId: greenValley.id },
    { email: 'buyer1@greenvalley.com', name: 'Anthony Buyer', passwordHash: pw, role: 'buyer', cooperativeId: greenValley.id },
    { email: 'buyer2@greenvalley.com', name: 'Mercy Wanjiku', passwordHash: pw, role: 'buyer', cooperativeId: greenValley.id },
    { email: 'unassigned@test.com', name: 'New User', passwordHash: pw, role: 'buyer', cooperativeId: null },
  ]).returning()
  console.log('  ✓ 8 users (admin, 2 managers, 2 drivers, 2 buyers, 1 unassigned)')

  // Update cooperative createdBy
  await db.update(cooperatives).set({ createdBy: manager1.id }).where(eq(cooperatives.id, greenValley.id))
  await db.update(cooperatives).set({ createdBy: admin.id }).where(eq(cooperatives.id, easternHighlands.id))

  // ── Warehouses ──
  const [warehouse1, warehouse2] = await db.insert(warehouses).values([
    { name: 'Green Valley Cold Store', location: 'Western Province Hub', totalCapacityKg: 2000, cooperativeId: greenValley.id },
    { name: 'Highland Distribution Center', location: 'Eastern Province Depot', totalCapacityKg: 3000, cooperativeId: easternHighlands.id },
  ]).returning()
  console.log('  ✓ 2 warehouses')

  // ── Harvest Entries ──
  const harvests = await db.insert(harvestEntries).values([
    { cropType: 'Maize', qualityGrade: 'A', quantity: 500, fieldId: 'FIELD-001', createdBy: manager1.id, warehouseId: warehouse1.id },
    { cropType: 'Beans', qualityGrade: 'B', quantity: 200, fieldId: 'FIELD-002', createdBy: manager1.id, warehouseId: warehouse1.id },
    { cropType: 'Tomatoes', qualityGrade: 'A', quantity: 150, fieldId: 'FIELD-003', createdBy: manager2.id, warehouseId: warehouse2.id },
    { cropType: 'Cabbage', qualityGrade: 'C', quantity: 300, fieldId: 'FIELD-004', createdBy: manager2.id, warehouseId: warehouse2.id },
    { cropType: 'Potatoes', qualityGrade: 'A', quantity: 400, fieldId: 'FIELD-005', createdBy: manager1.id, warehouseId: warehouse1.id },
    { cropType: 'Coffee', qualityGrade: 'A', quantity: 100, fieldId: 'FIELD-006', createdBy: manager2.id, warehouseId: null },
    { cropType: 'Tea', qualityGrade: 'B', quantity: 250, fieldId: 'FIELD-007', createdBy: manager1.id, warehouseId: null },
    { cropType: 'Avocados', qualityGrade: 'A', quantity: 180, fieldId: 'FIELD-008', createdBy: manager2.id, warehouseId: warehouse2.id },
  ]).returning()
  console.log('  ✓ 8 harvest entries (various crops, grades, quantities)')

  // ── Vehicles ──
  const [truck1, pickup1, motorcycle1, truck2] = await db.insert(vehicles).values([
    { name: 'Coaster Box Truck', type: 'truck', plateNumber: 'KBA 123A', payloadCapacity: 2000, status: 'available' },
    { name: 'Hilux Pickup', type: 'pickup', plateNumber: 'KBB 456B', payloadCapacity: 800, status: 'in-use' },
    { name: 'Delivery Bike', type: 'motorcycle', plateNumber: 'KBC 789C', payloadCapacity: 50, status: 'available' },
    { name: 'Canter Truck', type: 'truck', plateNumber: 'KBD 012D', payloadCapacity: 3000, status: 'maintenance' },
  ]).returning()
  console.log('  ✓ 4 vehicles (2 trucks, 1 pickup, 1 motorcycle)')

  // ── Orders ──
  const [
    orderPending, orderConfirmed, orderAssigned, orderTransit, orderDelivered, orderDelivered2,
  ] = await db.insert(orders).values([
    { orderNumber: 'ORD-000001', harvestId: harvests[0].id, buyerId: buyer1.id, quantity: 100, status: 'pending' },
    { orderNumber: 'ORD-000002', harvestId: harvests[1].id, buyerId: buyer1.id, quantity: 50, status: 'confirmed', confirmedBy: manager1.id },
    { orderNumber: 'ORD-000003', harvestId: harvests[2].id, buyerId: buyer2.id, quantity: 75, status: 'confirmed', confirmedBy: manager1.id, assignedDriverId: driver1.id },
    { orderNumber: 'ORD-000004', harvestId: harvests[4].id, buyerId: buyer1.id, quantity: 200, status: 'in-transit', confirmedBy: manager1.id, assignedDriverId: driver1.id },
    { orderNumber: 'ORD-000005', harvestId: harvests[3].id, buyerId: buyer2.id, quantity: 120, status: 'delivered', confirmedBy: manager2.id, assignedDriverId: driver2.id },
    { orderNumber: 'ORD-000006', harvestId: harvests[5].id, buyerId: buyer1.id, quantity: 60, status: 'delivered', confirmedBy: manager1.id, assignedDriverId: driver2.id },
  ]).returning()
  console.log('  ✓ 6 orders (1 pending, 1 confirmed, 1 assigned, 1 in-transit, 2 delivered)')

  // ── Assignments ──
  await db.insert(assignments).values([
    { harvestId: harvests[0].id, vehicleId: truck1.id, driverName: 'David Driver', destination: 'Nairobi Market' },
    { harvestId: harvests[2].id, vehicleId: pickup1.id, driverName: 'David Driver', destination: 'Mombasa Warehouse' },
    { harvestId: harvests[4].id, vehicleId: truck1.id, driverName: 'Grace Njeri', destination: 'Kisumu Distribution' },
    { harvestId: harvests[5].id, vehicleId: motorcycle1.id, driverName: 'Grace Njeri', destination: 'Local Café' },
  ]).returning()
  console.log('  ✓ 4 assignments')

  // ── Notifications ──
  await db.insert(notifications).values([
    { userId: manager1.id, type: 'order_placed', message: 'New order ORD-000001 placed for 100kg Maize', orderId: orderPending.id, read: false },
    { userId: manager1.id, type: 'order_placed', message: 'New order ORD-000002 placed for 50kg Beans', orderId: orderConfirmed.id, read: true },
    { userId: buyer1.id, type: 'order_confirmed', message: 'Order ORD-000002 has been confirmed', orderId: orderConfirmed.id, read: false },
    { userId: buyer2.id, type: 'driver_assigned', message: 'A driver has been assigned to order ORD-000003', orderId: orderAssigned.id, read: false },
    { userId: driver1.id, type: 'driver_assigned', message: 'You have been assigned to order ORD-000004', orderId: orderTransit.id, read: true },
    { userId: buyer1.id, type: 'status_changed', message: 'Order ORD-000004 is now in transit', orderId: orderTransit.id, read: false },
    { userId: buyer2.id, type: 'status_changed', message: 'Order ORD-000005 is now delivered', orderId: orderDelivered.id, read: true },
  ]).returning()
  console.log('  ✓ 7 notifications (mix of types, read/unread)')

  console.log('\nSeed complete! Login credentials (all passwords: password123):')
  console.log('  Admin:       admin@coop.com')
  console.log('  Manager:     manager@greenvalley.com')
  console.log('  Manager 2:   manager2@greenvalley.com')
  console.log('  Driver:      driver1@greenvalley.com')
  console.log('  Driver 2:    driver2@greenvalley.com')
  console.log('  Buyer:       buyer1@greenvalley.com')
  console.log('  Buyer 2:     buyer2@greenvalley.com')
  console.log('  Unassigned:  unassigned@test.com')
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
