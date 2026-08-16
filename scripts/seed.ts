import { getDb } from '../src/app/db'
import { harvestEntries, orders } from '../src/app/db/schema'
import { sampleHarvests, sampleOrders } from '../src/app/lib/seed-data'

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

  const harvestIdMap = new Map<string, string>()
  sampleHarvests.forEach((sample, index) => {
    harvestIdMap.set(sample.fieldId, insertedHarvests[index].id)
  })

  const ordersWithIds = sampleOrders.map((order) => ({
    ...order,
    harvestId: harvestIdMap.get(order.harvestId) ?? insertedHarvests[0].id,
  }))

  const insertedOrders = await db.insert(orders).values(ordersWithIds).returning()

  console.log(`Inserted ${insertedOrders.length} orders`)
  console.log('Seeding complete!')
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
