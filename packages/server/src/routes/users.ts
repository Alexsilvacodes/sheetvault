import { FastifyInstance } from 'fastify';
import { getDb } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

interface CreateUserBody {
  username: string;
}

interface UserParams {
  username: string;
}

interface UserRow {
  id: string;
  username: string;
  created_at: string;
}

function formatUser(row: UserRow) {
  return {
    id: row.id,
    username: row.username,
    created_at: row.created_at
  };
}

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  // Create or get user by username
  fastify.post<{ Body: CreateUserBody }>('/users', async (request, reply) => {
    const { username } = request.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return reply.status(400).send({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const db = getDb();

    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(trimmedUsername) as UserRow | undefined;

    if (existingUser) {
      return formatUser(existingUser);
    }

    // Create new user
    const id = uuidv4();
    db.prepare('INSERT INTO users (id, username) VALUES (?, ?)').run(id, trimmedUsername);

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
    return formatUser(newUser);
  });

  // Get user by username
  fastify.get<{ Params: UserParams }>('/users/:username', async (request, reply) => {
    const { username } = request.params;
    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.toLowerCase()) as UserRow | undefined;

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return formatUser(user);
  });
}
