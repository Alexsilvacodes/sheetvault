import Database from 'better-sqlite3';
import { initializeSchema } from './schema.js';
import { seedTemplates } from './seed.js';

const DATABASE_PATH = process.env.DATABASE_PATH || './data/sheetvault.db';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DATABASE_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema(db);
    seedTemplates(db);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
