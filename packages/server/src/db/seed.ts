import Database from 'better-sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function seedTemplates(db: Database.Database): void {
  const templatesDir = join(__dirname, '..', 'templates');

  const files = readdirSync(templatesDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = join(templatesDir, file);
    const template = JSON.parse(readFileSync(filePath, 'utf-8'));
    const schemaJson = JSON.stringify(template.schema);

    const existing = db.prepare('SELECT id, schema FROM templates WHERE slug = ?').get(template.slug) as { id: string; schema: string } | undefined;

    if (existing) {
      const existingSchema = JSON.parse(existing.schema);
      if (existingSchema.version !== template.schema.version) {
        db.prepare('UPDATE templates SET name = ?, schema = ? WHERE id = ?').run(
          template.name,
          schemaJson,
          existing.id
        );
        console.log(`Updated ${template.name} template to v${template.schema.version}`);
      }
      continue;
    }

    db.prepare(`
      INSERT INTO templates (id, name, slug, schema)
      VALUES (?, ?, ?, ?)
    `).run(
      uuidv4(),
      template.name,
      template.slug,
      schemaJson
    );

    console.log(`Seeded ${template.name} template`);
  }
}
