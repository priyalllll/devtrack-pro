// server/prisma/seed.js
// ─────────────────────────────────────────────────────────────────────────────
// Development seed script.
// Run with: npm run db:seed
// This will be populated with sample data in Phase 2 after authentication is built.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Placeholder — seed data will be added in Phase 2 ──────────────────────
  // When auth is ready, this file will create:
  //   - 2 demo users
  //   - 2 demo projects with default columns
  //   - Sample tasks with priorities and labels
  console.log('ℹ️  No seed data yet — will be added in Phase 2 with auth.')

  console.log('✅ Seeding complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
