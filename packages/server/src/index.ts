import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import { userRoutes } from './routes/users.js';
import { templateRoutes } from './routes/templates.js';
import { sheetRoutes } from './routes/sheets.js';
import { uploadRoutes } from './routes/uploads.js';
import { closeDb } from './db/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dataDir = process.env.DATABASE_PATH
  ? dirname(process.env.DATABASE_PATH)
  : './data';

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = join(dataDir, 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const fastify = Fastify({
  logger: true
});

await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:5173', 'http://127.0.0.1:5173']
});

await fastify.register(fastifyMultipart, {
  limits: { fileSize: 11 * 1024 * 1024 }
});

// Serve uploaded files
await fastify.register(fastifyStatic, {
  root: resolve(uploadsDir),
  prefix: '/api/uploads/',
  decorateReply: false
});

// API routes
fastify.register(userRoutes, { prefix: '/api' });
fastify.register(templateRoutes, { prefix: '/api' });
fastify.register(sheetRoutes, { prefix: '/api' });
fastify.register(uploadRoutes, { prefix: '/api' });

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = join(__dirname, '../../client/build');
  if (existsSync(clientDistPath)) {
    await fastify.register(fastifyStatic, {
      root: clientDistPath,
      prefix: '/'
    });

    // SPA fallback
    fastify.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api')) {
        return reply.status(404).send({ error: 'Not found' });
      }
      return reply.sendFile('index.html');
    });
  }
}

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  await fastify.close();
  closeDb();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
