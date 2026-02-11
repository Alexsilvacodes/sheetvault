import { FastifyInstance } from 'fastify';
import { getDb } from '../db/index.js';
import { getPermission } from './sheets.js';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname, extname } from 'path';

interface SheetParams {
  id: string;
}

interface ImageQuery {
  userId?: string;
}

interface SheetRow {
  id: string;
  user_id: string;
  data: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

function getUploadsDir(): string {
  const dataDir = process.env.DATABASE_PATH
    ? dirname(process.env.DATABASE_PATH)
    : './data';
  return join(dataDir, 'uploads');
}

export async function uploadRoutes(fastify: FastifyInstance): Promise<void> {
  // Upload sheet image
  fastify.post<{ Params: SheetParams; Querystring: ImageQuery }>('/sheets/:id/image', async (request, reply) => {
    const { id } = request.params;
    const { userId } = request.query;

    if (!userId) {
      return reply.status(400).send({ error: 'userId is required' });
    }

    const db = getDb();

    // Check sheet exists
    const sheet = db.prepare('SELECT id, user_id, data FROM sheets WHERE id = ?').get(id) as SheetRow | undefined;
    if (!sheet) {
      return reply.status(404).send({ error: 'Sheet not found' });
    }

    // Check permission
    const permission = getPermission(db, id, userId);
    if (permission !== 'owner' && permission !== 'crew_member') {
      return reply.status(403).send({ error: 'Permission denied' });
    }

    const file = await request.file();
    if (!file) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return reply.status(400).send({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' });
    }

    // Read file buffer
    const buffer = await file.toBuffer();

    // Validate size
    if (buffer.length > MAX_FILE_SIZE) {
      return reply.status(400).send({ error: 'File too large. Maximum size is 10 MB.' });
    }

    // Generate filename: {sheetId}-{hash}.{ext}
    const hash = createHash('md5').update(buffer).digest('hex').substring(0, 8);
    const ext = MIME_TO_EXT[file.mimetype] || extname(file.filename);
    const filename = `${id}-${hash}${ext}`;

    // Ensure uploads directory exists
    const uploadsDir = getUploadsDir();
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const sheetData = JSON.parse(sheet.data);
    const oldImage = sheetData.image;

    // Write new file first
    writeFileSync(join(uploadsDir, filename), buffer);

    // Update sheet data
    sheetData.image = filename;
    db.prepare('UPDATE sheets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(JSON.stringify(sheetData), id);

    // Delete old image after new one is safely saved
    if (oldImage && oldImage !== filename) {
      const oldPath = join(uploadsDir, oldImage);
      try { if (existsSync(oldPath)) unlinkSync(oldPath); } catch { /* best-effort */ }
    }

    return { image: filename };
  });

  // Delete sheet image
  fastify.delete<{ Params: SheetParams; Querystring: ImageQuery }>('/sheets/:id/image', async (request, reply) => {
    const { id } = request.params;
    const { userId } = request.query;

    if (!userId) {
      return reply.status(400).send({ error: 'userId is required' });
    }

    const db = getDb();

    const sheet = db.prepare('SELECT id, user_id, data FROM sheets WHERE id = ?').get(id) as SheetRow | undefined;
    if (!sheet) {
      return reply.status(404).send({ error: 'Sheet not found' });
    }

    const permission = getPermission(db, id, userId);
    if (permission !== 'owner' && permission !== 'crew_member') {
      return reply.status(403).send({ error: 'Permission denied' });
    }

    const sheetData = JSON.parse(sheet.data);
    if (sheetData.image) {
      const uploadsDir = getUploadsDir();
      const imagePath = join(uploadsDir, sheetData.image);
      if (existsSync(imagePath)) {
        unlinkSync(imagePath);
      }

      delete sheetData.image;
      db.prepare('UPDATE sheets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(JSON.stringify(sheetData), id);
    }

    return { success: true };
  });
}
