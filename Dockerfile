FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json

RUN npm ci

COPY server ./server
COPY client ./client

RUN npm run build

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=5001
ENV FRONTEND_URL=http://localhost:5001
ENV ALLOWED_DOMAINS=http://localhost:5001,http://127.0.0.1:5001
ENV TS_NODE_PROJECT=/app/server/tsconfig.runtime.json

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/tsconfig.json ./server/tsconfig.json
COPY --from=builder /app/server/tsconfig.runtime.json ./server/tsconfig.runtime.json
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

WORKDIR /app/server

EXPOSE 5001

CMD ["node", "-r", "tsconfig-paths/register", "dist/server.js"]
