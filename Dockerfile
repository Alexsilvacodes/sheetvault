# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/server/package*.json ./packages/server/
COPY packages/client/package*.json ./packages/client/

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:20-slim AS production

WORKDIR /app

COPY package*.json ./
COPY packages/server/package*.json ./packages/server/

RUN npm ci --workspace=packages/server --omit=dev

COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/src/templates ./packages/server/dist/templates
COPY --from=builder /app/packages/client/build ./packages/client/build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "packages/server/dist/index.js"]
