/**
 * Run this script to create the invites table:
 *   npx tsx scripts/migrate-invites.ts
 */
import pg from 'pg'
import 'dotenv/config'

async function migrate() {
  console.log('Running invites migration...')

  for (let attempt = 1; attempt <= 3; attempt++) {
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    })

    try {
      await client.connect()

      await client.query(`CREATE TABLE IF NOT EXISTS invites (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL,
        role text NOT NULL CHECK (role IN ('admin', 'manager', 'driver', 'buyer')),
        cooperative_id uuid REFERENCES cooperatives(id),
        token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
        created_by uuid NOT NULL REFERENCES users(id),
        used_at timestamptz,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`)
      console.log('  ✓ Created invites table')

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
  process.exit(1)
}

migrate()
