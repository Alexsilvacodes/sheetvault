# SheetVault

A PWA for creating and managing RPG character sheets, starting with Blades in the Dark support.

## Tech Stack

- **Frontend**: SvelteKit (Svelte 5) + Vite 6 + Tailwind CSS
- **Backend**: Node.js + Fastify
- **Database**: SQLite with better-sqlite3
- **PWA**: Vite PWA plugin
- **Structure**: Monorepo

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts both the client (http://localhost:5173) and server (http://localhost:3000).

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
sheetvault/
├── packages/
│   ├── client/          # SvelteKit frontend
│   └── server/          # Fastify backend
├── scripts/
│   └── deploy.sh        # Pi deployment script
└── docker-compose.yml   # Docker deployment
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users | Create/get user by username |
| GET | /api/users/:username | Get user info |
| GET | /api/templates | List available game templates |
| GET | /api/templates/:slug | Get template schema |
| GET | /api/sheets | List user's sheets (query: userId) |
| POST | /api/sheets | Create new sheet |
| GET | /api/sheets/:id | Get sheet by ID |
| PUT | /api/sheets/:id | Update sheet |
| DELETE | /api/sheets/:id | Delete sheet |

## Deployment

### Docker (Raspberry Pi)

```bash
docker-compose up -d
```

### Manual

```bash
./scripts/deploy.sh
```

## License

[GPL](LICENSE)
