# Product Catalog

A full-stack proof of concept for browsing, searching, filtering, and enquiring about products. The application uses a React/TypeScript client and an Express/TypeScript backend, with product metadata sourced from the Fake Store API through the backend.

## Challenge alignment

This submission implements the React + TypeScript web client and Node.js + TypeScript backend options from the challenge. It was built for a quick local proof of concept while retaining module boundaries that allow the product repository, frontend presentation, and email provider to be replaced.

The implementation deliberately does not call Fake Store API from the browser.

| Acceptance area | Status |
| --- | --- |
| Home catalogue with top-rated filter | Implemented; a “Top Rated” category requests five products sorted by `rating.rate`. The default initial view is the paginated full catalogue. |
| Category browsing | Implemented with a category filter and paginated category results. |
| Search | Implemented as a 300 ms debounced text search over title, description, and category; unlike the criterion, submission is automatic rather than requiring a Search button. |
| Product details | Implemented at `/products/:id` with title, image, description, price, category, rating, and review count. |
| Enquiry and thank-you state | Implemented with client/server validation, persistence abstraction, email delivery, and an in-browser thank-you state. |

The PR description, repository access, and challenge files should be reviewed together when submitting.

## Architecture

```text
Browser
  -> React SPA
  -> /api/v1 via fetch
  -> Express API
     -> Product service / repository port
     -> Fake Store API
     -> Enquiry service / repository port
     -> Nodemailer
Browser route fallback <- Express static server
```

- `client/src/pages`: application routes and page-level state.
- `client/src/features`: catalogue and enquiry APIs and components.
- `server/src/modules/products`: product domain, service, HTTP controller, and repository adapter.
- `server/src/modules/product_enquiries`: enquiry domain, service, HTTP controller, and repository adapter.
- `server/src/shared/services/mailer.service.ts`: email abstraction and HTML escaping.
- `server/src/index.ts`: API mounting, CORS, Helmet, and static SPA serving.

## Local setup

Requirements: Node.js 18 or newer and npm workspaces.

```bash
npm install
cp server/.env.example server/.env
npm run dev
```

The development command builds the React client and starts Express on `http://localhost:5001`. Open that URL; API routes are under `/api/v1`.

For a separate Vite client workflow, copy `client/.env.example` if needed. The default client API path is `http://localhost:5001`.

## Docker Compose

Docker Compose is the recommended setup because it packages the build, runtime dependencies, static client, Express server, environment defaults, health check, and shutdown behavior in one portable container.

Requirements: Docker Desktop or Docker Engine with the Compose plugin.

```bash
docker compose up
```

Open `http://localhost:5001`. The first run may build the image and take a minute; subsequent starts reuse the image and are faster. After changing source files, use `docker compose up --build`.

Stop and remove the project container:

```bash
docker compose down
```

No host Node.js installation or OS-specific scripts are required. Compose reads optional overrides from a root `.env` file or shell environment, including:

- `APP_PORT` (host browser port; defaults to `5001`)
- `FRONTEND_URL`
- `SALES_EMAIL`
- `ALLOWED_DOMAINS`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
- `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

The container defaults to production mode, port 5001, same-origin browser requests, and the same no-account Ethereal mail fallback when SMTP settings are blank.

## Environment

`server/.env.example` documents all supported settings. Do not commit `server/.env` or real credentials.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5001` | Express port |
| `NODE_ENV` | `development` | Controls static/Vite serving and error details |
| `FRONTEND_URL` | `http://localhost:5001` | Frontend URL configuration |
| `SALES_EMAIL` | `sales@productcatalog.local` | Recipient for sales enquiries |
| `ALLOWED_DOMAINS` | Localhost origins | CORS allowlist for browser API requests |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Blank / `587` / `false` | Optional authenticated SMTP provider |
| `SMTP_USER` / `SMTP_PASS` | Blank | SMTP credentials |
| `SMTP_FROM` | Product Catalog sender | From address |

When SMTP is not configured, Nodemailer creates a temporary Ethereal account for local development. That provides an email preview and exercises the delivery path without a paid account. Configure real SMTP only for delivery to an actual inbox.

## Commands

```bash
npm run dev          # build client, then run Express on port 5001
npm run build        # build server and client
npm run test         # run server and client suites
npm run test:server
npm run test:client
npm run lint
```

## API routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/v1/products` | Paginated products; optional `category`, `page`, and `limit` |
| `GET` | `/api/v1/products/:id` | One product |
| `GET` | `/api/v1/products/top-rated?limit=5` | Highest-rated products by `rating.rate` |
| `GET` | `/api/v1/product-categories` | Distinct categories |
| `POST` | `/api/v1/enquiries` | Create an enquiry and send a sales email |
| `GET` | `/api/v1/enquiries` | Retrieve enquiries (currently a simulated repository) |

## Testing

Vitest and Testing Library cover the critical client and server flows:

- catalogue loading, filtering, search rendering, and pagination;
- category selection and product cards;
- product detail loading;
- enquiry form validation and submission;
- controller validation and service behavior;
- top-rated sorting, repository boundaries, and mailer behavior.

Run `npm test` for both workspaces.

## Known limitations

- The enquiry repository simulates persistence in memory by returning created data; `GET /enquiries` does not expose an equivalent durable store.
- The current same-origin static build avoids cross-origin problems, but source changes require rebuilding because `npm run dev` performs the client build before server startup.
- Fake Store API availability is an external runtime dependency; the backend currently does not cache or provide a resilient fallback dataset.
- Category links show category products together; the UI does not visually separate a category’s top-rated subset from additional category products.
- Search filters the already loaded page because catalogue loading is performed in page-sized batches. It is not yet a backend-wide search.
- The product availability label is a UI placeholder and does not come from the source API.
- SMTP defaults to Ethereal rather than a guaranteed real sales inbox.

See `DECISIONS.md` for assumptions and trade-offs, and `AI_USAGE.md` for AI assistance and review notes.