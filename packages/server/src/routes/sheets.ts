import { FastifyInstance } from 'fastify';
import { getDb } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

interface SheetParams {
  id: string;
}

interface SheetQuery {
  userId?: string;
}

interface CreateSheetBody {
  userId: string;
  templateId: string;
  name: string;
  data?: Record<string, unknown>;
}

interface UpdateSheetBody {
  name?: string;
  data?: Record<string, unknown>;
}

interface ShareBody {
  username: string;
  userId: string;
}

interface ShareParams {
  id: string;
  userId: string;
}

interface SheetRow {
  id: string;
  user_id: string;
  template_id: string;
  name: string;
  data: string;
  created_at: string;
  updated_at: string;
}

function parseSheetRow(row: SheetRow) {
  return {
    ...row,
    data: JSON.parse(row.data)
  };
}

type Permission = 'owner' | 'crew_member' | 'shared' | 'none';

function getPermission(db: ReturnType<typeof getDb>, sheetId: string, userId: string): Permission {
  // Check owner
  const sheet = db.prepare('SELECT user_id FROM sheets WHERE id = ?').get(sheetId) as { user_id: string } | undefined;
  if (!sheet) return 'none';
  if (sheet.user_id === userId) return 'owner';

  // Check crew member: does the user have a character sheet whose crew field = this sheet's id?
  const crewLink = db.prepare(`
    SELECT 1 FROM sheets s
    JOIN templates t ON s.template_id = t.id
    WHERE s.user_id = ?
      AND json_extract(t.schema, '$.type') = 'character'
      AND json_extract(s.data, '$.crew') = ?
    LIMIT 1
  `).get(userId, sheetId);
  if (crewLink) return 'crew_member';

  // Check shared
  const share = db.prepare('SELECT 1 FROM sheet_shares WHERE sheet_id = ? AND shared_with_user_id = ?').get(sheetId, userId);
  if (share) return 'shared';

  return 'none';
}

export async function sheetRoutes(fastify: FastifyInstance): Promise<void> {
  // List crew sheets (for dropdown)
  fastify.get('/sheets/crews', async () => {
    const db = getDb();
    const crews = db.prepare(`
      SELECT s.id, s.name
      FROM sheets s
      JOIN templates t ON s.template_id = t.id
      WHERE json_extract(t.schema, '$.type') = 'crew'
      ORDER BY s.name
    `).all() as { id: string; name: string }[];
    return crews;
  });

  // List members of a crew (characters whose data.crew = crewId)
  fastify.get<{ Params: { crewId: string } }>('/sheets/crews/:crewId/members', async (request) => {
    const { crewId } = request.params;
    const db = getDb();

    const members = db.prepare(`
      SELECT s.id, s.name, u.username as owner_name, json_extract(s.data, '$.playbook') as playbook
      FROM sheets s
      JOIN templates t ON s.template_id = t.id
      JOIN users u ON s.user_id = u.id
      WHERE json_extract(t.schema, '$.type') = 'character'
        AND json_extract(s.data, '$.crew') = ?
      ORDER BY s.name
    `).all(crewId) as { id: string; name: string; owner_name: string; playbook: string | null }[];

    return members;
  });

  // List sheets (requires userId, returns owned + crew-linked + shared)
  fastify.get<{ Querystring: SheetQuery }>('/sheets', async (request, reply) => {
    const { userId } = request.query;
    const db = getDb();

    if (!userId) {
      return reply.status(400).send({ error: 'userId is required' });
    }

    // Owned sheets
    const ownedSheets = db.prepare(`
      SELECT s.*, t.name as template_name, t.slug as template_slug, u.username as user_name
      FROM sheets s
      JOIN templates t ON s.template_id = t.id
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?
      ORDER BY s.updated_at DESC
    `).all(userId) as SheetRow[];

    // Crew-linked sheets: crew sheets where the user has a character with crew = crew_sheet.id
    const crewSheets = db.prepare(`
      SELECT DISTINCT cs.*, t.name as template_name, t.slug as template_slug, u.username as user_name
      FROM sheets cs
      JOIN templates t ON cs.template_id = t.id
      JOIN users u ON cs.user_id = u.id
      WHERE cs.id IN (
        SELECT json_extract(charSheet.data, '$.crew')
        FROM sheets charSheet
        JOIN templates ct ON charSheet.template_id = ct.id
        WHERE charSheet.user_id = ?
          AND json_extract(ct.schema, '$.type') = 'character'
          AND json_extract(charSheet.data, '$.crew') IS NOT NULL
          AND json_extract(charSheet.data, '$.crew') != ''
      )
      AND cs.user_id != ?
      ORDER BY cs.updated_at DESC
    `).all(userId, userId) as SheetRow[];

    // Shared sheets
    const sharedSheets = db.prepare(`
      SELECT s.*, t.name as template_name, t.slug as template_slug, u.username as user_name
      FROM sheets s
      JOIN templates t ON s.template_id = t.id
      JOIN users u ON s.user_id = u.id
      JOIN sheet_shares ss ON ss.sheet_id = s.id
      WHERE ss.shared_with_user_id = ?
      ORDER BY s.updated_at DESC
    `).all(userId) as SheetRow[];

    const ownedIds = new Set(ownedSheets.map(s => s.id));
    const crewIds = new Set(crewSheets.map(s => s.id));

    const result = [
      ...ownedSheets.map(s => ({ ...parseSheetRow(s), permission: 'owner' as const })),
      ...crewSheets.filter(s => !ownedIds.has(s.id)).map(s => ({ ...parseSheetRow(s), permission: 'crew_member' as const })),
      ...sharedSheets.filter(s => !ownedIds.has(s.id) && !crewIds.has(s.id)).map(s => ({ ...parseSheetRow(s), permission: 'shared' as const }))
    ];

    return result;
  });

  // Create new sheet
  fastify.post<{ Body: CreateSheetBody }>('/sheets', async (request, reply) => {
    const { userId, templateId, name, data = {} } = request.body;

    if (!userId || !templateId || !name) {
      return reply.status(400).send({ error: 'userId, templateId, and name are required' });
    }

    const db = getDb();

    // Verify user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Verify template exists and get schema for defaults
    const template = db.prepare('SELECT id, schema FROM templates WHERE id = ?').get(templateId) as { id: string; schema: string } | undefined;
    if (!template) {
      return reply.status(404).send({ error: 'Template not found' });
    }

    // Use defaultData from schema when no data provided
    let sheetData = data;
    if (Object.keys(sheetData).length === 0) {
      const schema = JSON.parse(template.schema);
      if (schema.defaultData) {
        sheetData = { ...schema.defaultData };
      }
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO sheets (id, user_id, template_id, name, data)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, templateId, name, JSON.stringify(sheetData));

    const sheet = db.prepare('SELECT * FROM sheets WHERE id = ?').get(id) as SheetRow;
    return parseSheetRow(sheet);
  });

  // Get sheet by ID
  fastify.get<{ Params: SheetParams; Querystring: SheetQuery }>('/sheets/:id', async (request, reply) => {
    const { id } = request.params;
    const { userId } = request.query;
    const db = getDb();

    const sheet = db.prepare(`
      SELECT s.*, t.name as template_name, t.slug as template_slug, t.schema as template_schema, u.username as user_name
      FROM sheets s
      JOIN templates t ON s.template_id = t.id
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(id) as (SheetRow & { template_schema: string; user_name: string }) | undefined;

    if (!sheet) {
      return reply.status(404).send({ error: 'Sheet not found' });
    }

    const permission = userId ? getPermission(db, id, userId) : undefined;

    return {
      ...parseSheetRow(sheet),
      template_schema: JSON.parse(sheet.template_schema),
      ...(permission !== undefined && { permission })
    };
  });

  // Update sheet
  fastify.put<{ Params: SheetParams; Body: UpdateSheetBody; Querystring: SheetQuery }>('/sheets/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, data } = request.body;
    const { userId } = request.query;

    const db = getDb();

    const existingSheet = db.prepare('SELECT * FROM sheets WHERE id = ?').get(id);
    if (!existingSheet) {
      return reply.status(404).send({ error: 'Sheet not found' });
    }

    // Permission check
    if (userId) {
      const permission = getPermission(db, id, userId);
      if (permission !== 'owner' && permission !== 'crew_member') {
        return reply.status(403).send({ error: 'You do not have permission to edit this sheet' });
      }
    }

    const updates: string[] = [];
    const values: (string | undefined)[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (data !== undefined) {
      updates.push('data = ?');
      values.push(JSON.stringify(data));
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      db.prepare(`UPDATE sheets SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const sheet = db.prepare('SELECT * FROM sheets WHERE id = ?').get(id) as SheetRow;
    return parseSheetRow(sheet);
  });

  // Delete sheet
  fastify.delete<{ Params: SheetParams }>('/sheets/:id', async (request, reply) => {
    const { id } = request.params;
    const db = getDb();

    const sheet = db.prepare('SELECT * FROM sheets WHERE id = ?').get(id);
    if (!sheet) {
      return reply.status(404).send({ error: 'Sheet not found' });
    }

    db.prepare('DELETE FROM sheets WHERE id = ?').run(id);

    return { success: true };
  });

  // Share sheet with user
  fastify.post<{ Params: SheetParams; Body: ShareBody }>('/sheets/:id/shares', async (request, reply) => {
    const { id } = request.params;
    const { username, userId } = request.body;

    if (!username || !userId) {
      return reply.status(400).send({ error: 'username and userId are required' });
    }

    const db = getDb();

    // Verify sheet exists and user is owner
    const sheet = db.prepare('SELECT user_id FROM sheets WHERE id = ?').get(id) as { user_id: string } | undefined;
    if (!sheet) {
      return reply.status(404).send({ error: 'Sheet not found' });
    }
    if (sheet.user_id !== userId) {
      return reply.status(403).send({ error: 'Only the owner can share this sheet' });
    }

    // Find target user
    const targetUser = db.prepare('SELECT id, username FROM users WHERE username = ?').get(username.trim().toLowerCase()) as { id: string; username: string } | undefined;
    if (!targetUser) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Prevent self-share
    if (targetUser.id === userId) {
      return reply.status(400).send({ error: 'Cannot share with yourself' });
    }

    // Check if already shared
    const existing = db.prepare('SELECT 1 FROM sheet_shares WHERE sheet_id = ? AND shared_with_user_id = ?').get(id, targetUser.id);
    if (existing) {
      return reply.status(409).send({ error: 'Already shared with this user' });
    }

    const shareId = uuidv4();
    db.prepare('INSERT INTO sheet_shares (id, sheet_id, shared_with_user_id) VALUES (?, ?, ?)').run(shareId, id, targetUser.id);

    return { success: true, sharedWith: targetUser.username };
  });

  // List shares for a sheet
  fastify.get<{ Params: SheetParams }>('/sheets/:id/shares', async (request, reply) => {
    const { id } = request.params;
    const db = getDb();

    const shares = db.prepare(`
      SELECT ss.id, ss.shared_with_user_id as user_id, u.username, ss.created_at as shared_at
      FROM sheet_shares ss
      JOIN users u ON ss.shared_with_user_id = u.id
      WHERE ss.sheet_id = ?
      ORDER BY ss.created_at DESC
    `).all(id) as { id: string; user_id: string; username: string; shared_at: string }[];

    return shares;
  });

  // Remove a share
  fastify.delete<{ Params: ShareParams }>('/sheets/:id/shares/:userId', async (request, reply) => {
    const { id, userId } = request.params;
    const db = getDb();

    const result = db.prepare('DELETE FROM sheet_shares WHERE sheet_id = ? AND shared_with_user_id = ?').run(id, userId);

    if (result.changes === 0) {
      return reply.status(404).send({ error: 'Share not found' });
    }

    return { success: true };
  });
}
