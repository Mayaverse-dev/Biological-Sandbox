import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();
  
  try {
    // Run init.sql to create tables
    const initSql = readFileSync(join(__dirname, 'init.sql'), 'utf-8');
    await client.query(initSql);
    console.log('✓ Tables created');

    // Check if species table already has data
    const { rows: existing } = await client.query('SELECT COUNT(*) FROM species');
    if (parseInt(existing[0].count) > 0) {
      console.log(`✓ Database already has ${existing[0].count} entries, skipping seed`);
      return;
    }

    // Import defaultEntries dynamically
    const { defaultEntries } = await import('../src/data/defaultEntries.js');

    // Insert each entry
    for (const entry of defaultEntries) {
      await client.query(
        `INSERT INTO species (
          name, icon, category, is_synthesized, generation,
          mech, source, what, how, combo, hooks,
          constraints_text, tags, stats
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          entry.name,
          entry.icon,
          entry.cat,
          false,
          0,
          entry.mech,
          entry.source,
          entry.what,
          entry.how,
          entry.combo,
          entry.hooks,
          entry.constraints,
          entry.tags,
          JSON.stringify(entry.stats)
        ]
      );
    }

    console.log(`✓ Seeded ${defaultEntries.length} base mechanisms`);
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
