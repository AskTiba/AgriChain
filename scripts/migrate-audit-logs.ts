/**
 * Run this script to create the audit_logs table:
 *   npx tsx scripts/migrate-audit-logs.ts
 */
import pg from 'pg'
import 'dotenv/config'

async function migrate() {
  console.log('Running audit_logs migration...')

  for (let attempt = 1; attempt <= 3; attempt++) {
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    })

    try {
      await client.connect()

      await client.query(`CREATE TABLE IF NOT EXISTS audit_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id),
        action text NOT NULL,
        entity_type text NOT NULL,
        entity_id uuid,
        details text,
        ip_address text,
        user_agent text,
        created_at timestamptz NOT NULL DEFAULT now()
      )`)
      console.log('  ✓ Created audit_logs table')

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
