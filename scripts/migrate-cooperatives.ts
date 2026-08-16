/**
 * Run this script to create the cooperatives table:
 *   npx tsx scripts/migrate-cooperatives.ts
 */
import pg from 'pg'
import 'dotenv/config'

async function migrate() {
  console.log('Running cooperatives migration...')

  for (let attempt = 1; attempt <= 3; attempt++) {
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    })

    try {
      await client.connect()

      await client.query(`CREATE TABLE IF NOT EXISTS cooperatives (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        location varchar(255) NOT NULL,
        created_by uuid,
        created_at timestamptz NOT NULL DEFAULT now()
      )`)
      console.log('  ✓ Created cooperatives table')

      await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_cooperative_id_fkey`)
      await client.query(`ALTER TABLE users ALTER COLUMN cooperative_id DROP NOT NULL`)
      await client.query(`ALTER TABLE users ALTER COLUMN cooperative_id TYPE uuid USING cooperative_id::uuid`)
      await client.query(`ALTER TABLE users ADD CONSTRAINT users_cooperative_id_fkey FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id)`)
      console.log('  ✓ Updated users.cooperative_id to uuid FK')

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
