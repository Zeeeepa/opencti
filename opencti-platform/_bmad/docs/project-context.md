---
project_name: 'opencti-platform'
user_name: 'Filigran'
date: '2026-01-11'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 15
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core Frameworks
*   **Frontend:** React 19.2.3, Relay 20.1.1, MUI v6.5.0
*   **Backend:** Node.js >=20.0.0, GraphQL 16.12.0
*   **Database:** ElasticSearch 8.19.1, Redis (via ioredis 5.8.2)

### Build & Test Tools
*   **Build:** Vite 7.3.0, esbuild 0.27.2
*   **Testing:** Vitest 4.0 (Unit), Playwright 1.57 (E2E)
*   **Linting:** ESLint 9.39, TypeScript 5.9

## Critical Implementation Rules (always execute all rules)

### Language-Specific Rules (TypeScript/JavaScript)

*   **Functional Programming:** **NO RAMDA**. Use pure JavaScript/TypeScript ES6+ features (`map`, `filter`, `reduce`, optional chaining). Remove `Ramda` usage where possible.
*   **Date Handling:** Use `Luxon` for all date/time operations. **DO NOT** use `Moment.js`.
*   **Async/Await:** Strict usage of `async/await`. Avoid `.then()` chains.
*   **Nullish Coalescing:** Use `??` and `?.` over `||` and checks like `&& object.property`.
*   **Typing:**
    *   **Frontend:** Strict TypeScript. Use generated Relay types (`__generated__`) for all data props.
    *   **Backend:** JSDoc + Flow-style checking (legacy) moving to TS. Respect existing file extensions (`.js` vs `.ts`).
    *   **New Domain Code:** MUST be written in TypeScript (`.ts`) within `src/modules/`. Do not add new logic to legacy `.js` domain files.
*   **Error Handling:**
    *   **Business Logic:** Throw `FunctionalError` (imported from `config/errors`) for user-facing validation errors.
    *   **System:** Throw `DatabaseError` or standard `Error` for internal failures.

### Framework-Specific Rules (React/Relay/GraphQL)

*   **Relay Hooks:** Use `useLazyLoadQuery` for top-level pages and `useFragment` for child components. Avoid ad-hoc `fetch` calls.
*   **Mutations:** Always use `commitMutation` with `updater` function to maintain Store consistency (avoid refetching entire lists).
*   **MUI v6:** Use `styled()` API or `sx` prop. Avoid `makeStyles` (legacy JSS).
    *   **Backend Resolvers:** Logic must NOT be in resolvers. Resolvers call `domain/` functions.
    *   **GraphQL Enums:** Prefer usage of **GraphQL Enums** over Strings when a fixed list of options is provided to an API. This ensures type safety and API clarity.
    *   **GraphQL Arrays:** List fields MUST be non-nullable (e.g., `[Type]!` or `[Type!]!`). Resolvers MUST return `[]` (empty array) instead of `null` or `undefined`.

### Localization & Translation Rules

*   **Strict 1:1 Parity:** Every translation key present in `en.json` MUST exist in **ALL** other supported language files (e.g., `es.json`, `fr.json`, `zh.json`, etc.).
    *   **Scope:** This applies to both Frontend (`lang/front`) and Backend (`lang/back`) translations.
    *   **Verification:** `yarn verify-translation` only checks usage vs `en.json`. You MUST ensure cross-language parity manually.
*   **Backend Translations:** Backend messages (e.g., errors, logs) are located in `opencti-front/lang/back`.
*   **Sorting:** AFTER adding keys, you MUST run `yarn sort-translation` in the frontend package to enforce alphabetical order.
*   **Workflow:**
    1. Add key to source code.
    2. Add English translation to `en.json`.
    3. Add translations to ALL other language files.
    4. Run `yarn sort-translation`.
    5. Run `yarn verify-translation`.

### Testing Rules

*   **Unit (Vitest):**
    *   Mock external calls using `vi.mock()`.
    *   Test business logic in `domain/` files extensively.
*   **E2E (Playwright):**
    *   Use `page.getByRole` locators for accessibility compliance.
    *   Use `page.getByRole` locators for accessibility compliance.
    *   Clean up data in `afterAll` hooks.

*   **Execution Guide (Critical for Agents):**
    *   **Integration Tests:** You MUST use `--config vitest.config.integration.ts` to spin up the test environment/server.
        *   ✅ Correct: `npx vitest run tests/03-integration/path/to/test.ts --config vitest.config.integration.ts`
        *   ❌ Wrong: `npx vitest run ...` (Will fail with `ECONNREFUSED`)
    *   **Filtering:** Use `-t "Test Name"` to run specific tests efficiently.

### Development Workflow Rules (always execute all rules)

*   **Mandatory Testing:**
    *   **Every Story Must Be Tested:** No story is complete without a comprehensive test suite (Unit, Integration, and/or E2E).
    *   **Strict Coverage Rule:** You must achieve **100% code coverage** for all NEW implementation (lines and branches).
    *   **Integration Testing:** Features exposed via GraphQL MUST have integration tests verifying the full stack (Resolver -> Domain -> DB).
    *   **Enforcement:** PRs/Stories without tests covering all new branches will be rejected.
    *   **Agent Verification:** The coding agent must explicitly run coverage tools (e.g., `vitest --coverage`) and verify the 100% target is met for new code before completing the story.

*   **Frontend Compatibility:**
    *   **No Breaking Changes:** Every backend story must maintain compatibility with the frontend.
    *   **Verification:** `yarn relay` must pass without error in the frontend workspace.
    *   **Cleanup:** If a backend API is removed, immediately remove its usage from the frontend to ensure the build passes.

*   **Mandatory Verification:**
    *   **Strict Compliance:** Code must pass **Linting (ESLint)** and **TypeScript** checks without any errors or warnings.
    *   **Spec Alignment:** Coding agents must ALWAYS align specifications (e.g., `epics.md`) when implementation details change during review or refactoring.
    *   **No Bypass:** Verification check is mandatory under all circumstances before marking a task as done.
    *   **Post-Edit Requirement:** AFTER ANY CODE CHANGE, you MUST run:
        1. `npm run check-ts`
        2. `npm run lint` (ESLint)
        3. Relevant Unit Tests (`npx vitest run ...`)
        4. Relevant Integration Tests (`npx vitest run ... --config vitest.config.integration.ts`)

*   **Git Workflow:**
    *   **Commit Per Story:** You MUST commit your changes to the git repository at the completion of each Story.
    *   **Authorization:** You MUST ask for user approval AND propose the commit message before running the commit command.
    *   **Format:** `[backend|frontend] Story X.Y: Short description (#IssueId if available)`.
    *   **Pre-requisite:** Checks (Lint, TS, Tests, Translation) MUST pass before committing.

*   **Naming:**
    *   Files: `camelCase.js` (Backend), `PascalCase.tsx` (Frontend Components).
    *   GraphQL: `snake_case` for fields, `PascalCase` for Types.
*   **Commits:** `[frontend|backend] Descriptive message (#IssueNumber)` (e.g., `[backend] Add token hashing support (#1234)`).

### Critical Don't-Miss Rules

*   **Security:**
    *   **Audit:** Important user action needs to be added in audit log through `publishUserAction` method
*   **Authentication:**
    *   **Cache:** Use `database/cache.ts` / `platformUsers` for auth lookup. DO NOT introduce new Redis calls for auth.
*   **Direct DB Access:** NEVER call ElasticSearch/Redis directly from Resolvers. Use `database/` adaptors.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-01-11
