// Resets the local SQLite database for a clean, idempotent demo setup.
// Honors DATABASE_URL (file:./x.db is relative to prisma/); defaults to prisma/dev.db.
const fs = require('fs');
const path = require('path');
try { require('dotenv').config(); } catch (_) { /* dotenv optional */ }

const url = process.env.DATABASE_URL || 'file:./dev.db';
const rel = url.replace(/^file:/, '').replace(/^"|"$/g, '');
const dbPath = path.isAbsolute(rel) ? rel : path.join(__dirname, '..', 'prisma', rel);

try {
  if (fs.existsSync(dbPath)) {
    fs.rmSync(dbPath, { force: true });
    console.log(`Removed existing database at ${dbPath} for a clean demo slate`);
  }
} catch (err) {
  console.warn('Could not remove database:', err.message);
}
console.log('Database reset complete.');
