const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'problems.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Apply schema on every start (CREATE TABLE IF NOT EXISTS — safe)
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// Seed only if sheets table is empty
const sheetCount = db.prepare('SELECT COUNT(*) as c FROM sheets').get().c;
if (sheetCount === 0) {
  console.log('📦 Empty database — applying seed...');
  const seed = fs.readFileSync(SEED_PATH, 'utf8');
  db.exec(seed);
  const total = db.prepare('SELECT COUNT(*) as c FROM problems').get().c;
  console.log(`✅ Seeded ${total} problems.`);
} else {
  const total = db.prepare('SELECT COUNT(*) as c FROM problems').get().c;
  console.log(`✅ Database ready — ${total} problems loaded.`);
}

module.exports = db;
