# Product Catalog

A full-stack product catalog application with a React client and an Express + TypeScript server.

## Stack
- Client: React + Vite + TypeScript
- Server: Express + TypeScript
- Testing: Vitest + Testing Library

## Setup
1. Install dependencies:
   npm install
2. Copy environment examples:
   - cp server/.env.example server/.env
   - cp client/.env.example client/.env
3. Start the app in development mode:
   npm run dev

## Useful commands
- npm run build
- npm run lint
- npm run test
- npm run test:server
- npm run test:client

## Project standards
- Keep environment variables validated and documented.
- Prefer typed services and explicit interfaces.
- Write tests for core business logic and user-facing behavior.
- Use safe HTML escaping before injecting user content into email templates.