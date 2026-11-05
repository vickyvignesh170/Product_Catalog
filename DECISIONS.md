# Decisions and Assumptions

## Assumptions

- “Top rated” means the products with the highest numeric Fake Store API `rating.rate`, not the highest review count.
- The home page exposes five top-rated products through a “Top Rated” category and a five-product API limit. The initial view remains a paginated catalogue so customers can browse the full catalogue.
- A category view means all matching category products; the five highest-rated products in that category are not duplicated into a separate visible section because no category layout was specified.
- Search is client-side text matching over title, description, and category for a loaded catalogue page. It updates after typing and does not require a separate submit action.
- Pagination is ten products per page on the server and client.
- A successful enquiry means both that the backend accepted the form and that Nodemailer completed its send attempt. The in-browser thank-you state is only shown after HTTP success.
- The reviewer should be able to run the app without creating a third-party account, so Ethereal is an optional no-cost local mail transport rather than a paid provider.

## Technology choices

React with TypeScript and Vite provide typed components, fast local iteration, routing, and a modern browser build. Express with TypeScript keeps the backend in the same language ecosystem and makes API contracts explicit. React Router supplies the product detail route and browser navigation. The monorepo npm workspaces keep one-command installation and shared scripts.

The client is not a direct Fake Store API consumer. A backend repository adapter fetches the upstream API, which protects the browser from provider coupling and gives the backend a future place for caching, transformation, retries, or another provider.

## Product data

The `ProductRepositoryPort` separates the application from provider-specific HTTP logic. `PostgresProductRepository` is a retained naming/architecture choice from the MVP, but it currently fetches Fake Store API data and does not use PostgreSQL. This is documented as a deliberate adapter simplification: the interface is ready for another repository implementation, while database infrastructure is not needed to prove the current catalogue.

Pagination is calculated by the backend after fetching provider data. This is easy to reason about for the 20-item demo source but would be moved to provider/database query parameters as the catalogue grows.

## Email and enquiries

The enquiry service depends on a `MailerService`, and the HTML template escapes untrusted user content before interpolation. SMTP credentials are read from environment variables. If SMTP credentials are absent, Nodemailer creates a temporary Ethereal account for previews. This satisfies local reviewability without paid dependencies.

The enquiry repository is simulated rather than durable. This preserves the repository boundary for a real database while keeping the time-box focused on the end-to-end customer path.

## Serving and CORS

The server serves the production client build on the same origin in normal development. This removes the SPA from its own development origin and ensures the catalogue opens at `http://localhost:5001`. Express falls back to Vite middleware when a build is absent, preserving a useful development path.

CORS is scoped to `/api/v1` rather than static assets or the whole Express application. The development mode also permits localhost and loopback origins; production should retain the explicit `ALLOWED_DOMAINS` allowlist only.

## Docker packaging

Docker Compose is the primary reproducible setup. One multi-stage image builds the React client and TypeScript server, then runs the compiled Express application and serves the built SPA from the same container. This keeps the client/server contract portable across macOS, Linux, and Windows without requiring host Node.js versions or OS-specific shell commands.

The container uses port 5001 by default and can override that port and application configuration through Compose environment variables. Runtime secrets are passed as environment variables and are never copied from `.env` files into the image. A health check verifies that the API is reachable, and Compose's init process plus the server's signal handlers support clean `docker compose down` shutdowns.

## Repository boundaries and growth

The frontend owns routing, presentation, local loading state, and form validation. The backend owns upstream data access, pagination, category transformations, enquiry validation, and email delivery. The repository/service/port pattern means product and enquiry data sources can be swapped independently.

For AWS compatibility, the Express process can run in a container or Lambda-style Node environment, the SPA can be served by S3/CloudFront, and SMTP/secret configuration can move to a secret manager. The application currently uses no AWS-specific infrastructure.

## Simplifications and dropped scope

- No persistent product database or migration layer.
- No persistent enquiry database or customer authentication.
- No shopping cart, checkout, inventory, or real “availability” calculation.
- No provider cache, retry policy, circuit breaker, or offline fallback.
- No production mail account; local Ethereal delivery is a preview-only mechanism.
- No shared component abstraction for every form or endpoint.
- Search was kept on the client-loaded page instead of adding a dedicated backend search contract.

These cuts keep the critical browse, detail, and enquiry path understandable and tested.

## What I would do next with another day

1. Make product and enquiry repositories durable with a migration-backed database.
2. Add category top-rated sections and move search to a backend query contract.
3. Add retry, timeout, cache, and fallback behavior for the upstream product API.
4. Add integration tests that boot Express and test real HTTP/CORS behavior.
5. Add accessibility checks, modal focus management, keyboard behavior, and error-state recovery.
6. Replace placeholder availability and improve category/search result counts.
7. Add Docker Compose or a documented container workflow for a repeatable two-command startup.

## Time spent

This work is estimated at roughly 3 hours in total:

- Planning and repository review: 25 minutes.
- Application implementation and bug fixing: 95 minutes.
- Tests and browser/API verification: 50 minutes.
- Documentation and final review: 30 minutes.
