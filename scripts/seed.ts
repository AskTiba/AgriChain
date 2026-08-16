import 'dotenv/config'
import { getDb } from '../src/app/db'
import { harvestEntries, orders, users } from '../src/app/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const sampleHarvests = [
  { cropType: 'Maize', qualityGrade: 'A', quantity: 500, fieldId: 'FIELD-001' },
  { cropType: 'Beans', qualityGrade: 'B', quantity: 200, fieldId: 'FIELD-002' },
  { cropType: 'Tomatoes', qualityGrade: 'A', quantity: 150, fieldId: 'FIELD-003' },
  { cropType: 'Cabbage', qualityGrade: 'C', quantity: 300, fieldId: 'FIELD-004' },
  { cropType: 'Potatoes', qualityGrade: 'A', quantity: 400, fieldId: 'FIELD-005' },
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

  // Create a test buyer for seed orders
  const passwordHash = await bcrypt.hash('password123', 12)
  const [buyer] = await db
    .insert(users)
    .values({
      email: 'buyer@test.com',
      name: 'Test Buyer',
      passwordHash,
      role: 'buyer',
    })
    .onConflictDoNothing()
    .returning()

  const buyerId = buyer?.id
  if (!buyerId) {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, 'buyer@test.com')).limit(1)
    if (existing.length > 0) {
      const sampleOrders = [
        { orderNumber: 'ORD-000001', buyerId: existing[0].id, quantity: 100, status: 'pending' as const, harvestIndex: 0 },
        { orderNumber: 'ORD-000002', buyerId: existing[0].id, quantity: 50, status: 'confirmed' as const, harvestIndex: 1 },
        { orderNumber: 'ORD-000003', buyerId: existing[0].id, quantity: 75, status: 'delivered' as const, harvestIndex: 2 },
      ]
      const ordersData = sampleOrders.map((o) => ({
        orderNumber: o.orderNumber,
        buyerId: o.buyerId,
        quantity: o.quantity,
        status: o.status,
        harvestId: insertedHarvests[o.harvestIndex].id,
      }))
      const insertedOrders = await db.insert(orders).values(ordersData).returning()
      console.log(`Inserted ${insertedOrders.length} orders`)
    }
  } else {
    const sampleOrders = [
      { orderNumber: 'ORD-000001', buyerId, quantity: 100, status: 'pending' as const, harvestIndex: 0 },
      { orderNumber: 'ORD-000002', buyerId, quantity: 50, status: 'confirmed' as const, harvestIndex: 1 },
      { orderNumber: 'ORD-000003', buyerId, quantity: 75, status: 'delivered' as const, harvestIndex: 2 },
    ]
    const ordersData = sampleOrders.map((o) => ({
      orderNumber: o.orderNumber,
      buyerId: o.buyerId,
      quantity: o.quantity,
      status: o.status,
      harvestId: insertedHarvests[o.harvestIndex].id,
    }))
    const insertedOrders = await db.insert(orders).values(ordersData).returning()
    console.log(`Inserted ${insertedOrders.length} orders`)
  }

  console.log('Seeding complete!')
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
