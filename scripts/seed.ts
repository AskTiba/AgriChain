import 'dotenv/config'
import { getDb } from '../src/app/db'
import { harvestEntries, orders } from '../src/app/db/schema'

const sampleHarvests = [
  { cropType: 'Maize', qualityGrade: 'A', quantity: 500, fieldId: 'FIELD-001' },
  { cropType: 'Beans', qualityGrade: 'B', quantity: 200, fieldId: 'FIELD-002' },
  { cropType: 'Tomatoes', qualityGrade: 'A', quantity: 150, fieldId: 'FIELD-003' },
  { cropType: 'Cabbage', qualityGrade: 'C', quantity: 300, fieldId: 'FIELD-004' },
  { cropType: 'Potatoes', qualityGrade: 'A', quantity: 400, fieldId: 'FIELD-005' },
]

const sampleOrders = [
  { orderNumber: 'ORD-000001', buyerId: 'buyer-001', quantity: 100, status: 'pending' as const, harvestIndex: 0 },
  { orderNumber: 'ORD-000002', buyerId: 'buyer-001', quantity: 50, status: 'confirmed' as const, harvestIndex: 1 },
  { orderNumber: 'ORD-000003', buyerId: 'buyer-002', quantity: 75, status: 'delivered' as const, harvestIndex: 2 },
]

async function seed() {
  const db = getDb()
  console.log('Seeding database...')

  await db.delete(orders)
  await db.delete(harvestEntries)

  const insertedHarvests = await db
    .insert(harvestEntries)
    .values(sampleHarvests)
    .returning()

  console.log(`Inserted ${insertedHarvests.length} harvest entries`)

  const ordersWithHarvestIds = sampleOrders.map((order) => ({
    orderNumber: order.orderNumber,
    buyerId: order.buyerId,
    quantity: order.quantity,
    status: order.status,
    harvestId: insertedHarvests[order.harvestIndex].id,
  }))

  const insertedOrders = await db.insert(orders).values(ordersWithHarvestIds).returning()

  console.log(`Inserted ${insertedOrders.length} orders`)
  console.log('Seeding complete!')
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
