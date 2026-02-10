import Database from 'better-sqlite3';

export function initializeSchema(db: Database.Database): void {
  db.exec(`
    -- Users (simple username-based)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Game Templates (system definitions)
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      schema TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Character Sheets
    CREATE TABLE IF NOT EXISTS sheets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      template_id TEXT NOT NULL,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (template_id) REFERENCES templates(id)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_sheets_user_id ON sheets(user_id);
    CREATE INDEX IF NOT EXISTS idx_sheets_template_id ON sheets(template_id);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug);
  `);

  // Migration: drop is_master column for existing databases
  const columns = db.pragma('table_info(users)') as { name: string }[];
  if (columns.some(c => c.name === 'is_master')) {
    db.exec('ALTER TABLE users DROP COLUMN is_master');
  }

  // Sheet sharing table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sheet_shares (
      id TEXT PRIMARY KEY,
      sheet_id TEXT NOT NULL,
      shared_with_user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE,
      FOREIGN KEY (shared_with_user_id) REFERENCES users(id),
      UNIQUE(sheet_id, shared_with_user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sheet_shares_sheet_id ON sheet_shares(sheet_id);
    CREATE INDEX IF NOT EXISTS idx_sheet_shares_shared_with ON sheet_shares(shared_with_user_id);
  `);
}
