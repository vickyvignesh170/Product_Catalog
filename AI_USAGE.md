# AI Usage Notes

## Tools and ownership

The implementation and this documentation were developed with an AI coding assistant using Copilot SDK in VS Code. AI suggestions were applied only after reviewing repository files, diffs, build output, tests, browser behavior, HTTP requests, and challenge requirements.

The submitted repository is human-owned and reviewable: the developer remains responsible for the architecture, environment handling, code changes, testing, and final behavior.

## Instruction and planning files

- No `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or project-specific agent instruction file was committed.
- No separate implementation plan file was retained for planning.
- Planning decisions and unresolved assumptions were carried through the conversation, code review, and these submission documents.

## Key prompts and moments

1. **Diagnose the blank browser:** “Some client modules and React Refresh are returning 500 on port 5001.” This led to browser reproduction, static serving, Vite fallback review, and confirmation that the browser—not unit tests—was the primary failure surface.

2. **Create an execution plan for Product catalog based on the instrunctions given in the document:** “Clear and close apps running on port 5001.” The listener was identified by PID and stopped before restarting the application for verification.

3. **Fix enquiries origin handling:** “The enquiries endpoint is blocked by CORS for origin `http://localhost:5001`.” Review found an incomplete and malformed origin allowlist; the fix added port 5001 and development localhost validation.

4. **Compare an implementation against acceptance criteria:** The challenge PDF was read and the product was compared category-by-category. This surfaced intentional trade-offs such as a filter-based top-rated view, automatic search, and simulated enquiry persistence.

5. **Generate maintainable challenge documentation:** The final README, decisions, assumptions, and AI notes were based on the actual repository rather than generated from acceptance criteria alone.

6. **Create portable Docker packaging:** Docker Compose packaging was directed at a single cross-platform command, with production static assets served by Express, environment overrides, health checks, and clean container shutdown.

## Mistakes caught during review

- **Initial test-only confidence:** Passing unit tests did not prove that the served browser modules were healthy. The browser reproduction caught the real blank-screen failure, which was addressed through static serving and server startup changes.
- **CORS applied too broadly or too narrowly:** Early application behavior needed API-only CORS middleware so static assets were not routed through API CORS handling. The allowlist also needed the actual port 5001 origin.
- **Cross-origin assumptions:** An absolute Vite API URL could introduce unnecessary browser CORS dependencies. Same-origin `/api/v1` is used by the root development setup.
- **Misleading persistence names:** The `Postgres...` names do not indicate that PostgreSQL is installed or used. The implementation was reviewed so the documentation describes the current upstream fetch and in-memory enquiry behavior accurately.
- **SPA serving ambiguity:** The static build and Vite middleware fallback are both valid paths. The documentation explains which path is selected and why the client must be rebuilt for the normal development script.
- **Runtime alias resolution:** The Docker runtime needed the server TypeScript path configuration and `tsconfig-paths` package available after the build, not just the compiled JavaScript and client assets.

## Review approach

I inspected source files, package scripts, environment examples, routes, repository implementations, tests, diffs, and HTTP/browser responses. AI-generated changes were checked against builds and browser behavior. The challenge’s acceptance gaps were converted into explicit assumptions rather than silently claimed as fully matching a stricter interpretation.

Final verification should include:

```bash
npm run build
npm test
curl http://localhost:5001/api/v1/products?page=1&limit=1
```

## Time and AI impact

Estimated total time: 3 hours, split approximately 25 minutes planning, 95 minutes implementation, 50 minutes testing/debugging, and 30 minutes documentation/review.

AI materially accelerated repository inspection, repetitive code paths, documentation drafting, error diagnosis, and validation command iteration. Human review was required to catch browser-only failures, verify actual HTTP behavior, correct origin configuration, and avoid overstating persistence or external email delivery.
