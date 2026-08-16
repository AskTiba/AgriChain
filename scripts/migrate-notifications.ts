/**
 * Run this script to create the notifications table:
 *   npx tsx scripts/migrate-notifications.ts
 */
import pg from 'pg'
import 'dotenv/config'

async function migrate() {
  console.log('Running notifications migration...')

  for (let attempt = 1; attempt <= 3; attempt++) {
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    })

    try {
      await client.connect()
      await client.query(`CREATE TABLE IF NOT EXISTS notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        type text NOT NULL CHECK (type IN ('order_placed', 'order_confirmed', 'driver_assigned', 'status_changed')),
        message text NOT NULL,
        order_id uuid REFERENCES orders(id),
        read boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
      )`)
      console.log('  ✓ Created notifications table')
      await client.end()
      console.log('Migration complete!')
      return
    } catch (e) {
      const err = e as Error
      console.log(`  Attempt ${attempt}/3 failed: ${err.message}`)
      await client.end().catch(() => {})
      if (attempt < 3) {
        console.log(`  Retrying in ${attempt * 5}s...`)
        await new Promise((r) => setTimeout(r, attempt * 5000))
      }
    }
  }

  console.error('Migration failed after 3 attempts.')
  console.error('Your Neon project may be paused. Resume it at https://console.neon.tech')
  process.exit(1)
}

migrate()
