import { FastifyInstance } from 'fastify';
import { getDb } from '../db/index.js';

interface TemplateParams {
  slug: string;
}

interface TemplateRow {
  id: string;
  name: string;
  slug: string;
  schema: string;
  created_at: string;
}

export async function templateRoutes(fastify: FastifyInstance): Promise<void> {
  // List all templates
  fastify.get('/templates', async () => {
    const db = getDb();
    const templates = db.prepare('SELECT id, name, slug, schema, created_at FROM templates').all() as TemplateRow[];
    return templates.map(t => {
      const schema = JSON.parse(t.schema);
      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        type: schema.type || 'character',
        created_at: t.created_at
      };
    });
  });

  // Get template by slug
  fastify.get<{ Params: TemplateParams }>('/templates/:slug', async (request, reply) => {
    const { slug } = request.params;
    const db = getDb();

    const template = db.prepare('SELECT * FROM templates WHERE slug = ?').get(slug) as TemplateRow | undefined;

    if (!template) {
      return reply.status(404).send({ error: 'Template not found' });
    }

    return {
      ...template,
      schema: JSON.parse(template.schema)
    };
  });
}
