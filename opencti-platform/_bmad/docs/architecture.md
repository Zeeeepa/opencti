---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['prd.md', 'ux-design-specification.md', '/Users/julienrichard/Documents/filigran/opencti/core-engine/docs/docs/deployment/authentication.md', '/Users/julienrichard/Documents/filigran/opencti/core-engine/docs/docs/administration/users.md', '/Users/julienrichard/Documents/filigran/opencti/core-engine/docs/docs/containerization/architecture.md']
workflowType: 'architecture'
lastStep: 8
status: 'complete'
project_name: 'opencti-platform'
user_name: 'Filigran'
date: '2026-01-11'
completedAt: '2026-01-11'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
1.  **Token Generation:** CSPRNG-based, format-compliant (`flgrn_octi_tkn_`), strictly one-time view in UI.
2.  **Token Management:** User self-service list (last 4 chars) and immediate revocation.
3.  **Administration:** Global view and revocation capability for Admins.
4.  **Security Core:** Encrypted storage (SHA256+), Zero-logging, Constant-time validation.

**Non-Functional Requirements:**
1.  **Security (Critical):** Zero-Knowledge (plaintext never stored), Zero-logs, Timing-attack resistance.
2.  **Performance:** <10ms overhead on validation.
3.  **Integration:** No breaking changes for existing API clients (transparent backend swap).
4.  **Accessibility:** WCAG AA (key navigation for copy).
5.  **Audit:** Strict immutable logging of all Lifecycle events.

**Scale & Complexity:**
The project is **Medium** complexity but **High** sensitivity.
-   **Primary Domain:** Backend Security & API Authorization (NodeJS/GraphQL) + Frontend Management (React/MUI).
-   **Complexity Level:** High (Security) / Low (Feature count).
-   **Estimated Components:** 4 (API Resolver, Auth Middleware, Migration Script, UI Drawer).

### Technical Constraints & Dependencies

1.  **Existing Auth System:** Must hook into standard OpenCTI `passport-http-bearer` or custom middleware strategies without disrupting session-based auth.
2.  **Database:** ElasticSearch usage for token persistence. *Note: OpenCTI uses an internal user cache system for authentication lookups.*
3.  **UI Library:** Strict dependency on MUI V5 (no custom CSS/styled-components if possible).
4.  **Legacy Tokens:** Must handle migration of existing UUID tokens to hash-based storage (Zero-downtime requirement).

### Cross-Cutting Concerns Identified

1.  **Audit Logging:** Every action (Gen/Revoke) touches the Audit subsystem.
2.  **Error Handling:** Unifying "Revoked", "Expired", and "Invalid" under standard 401/403 responses to prevent enumeration, while giving admins visibility.
3.  **Traceability:** Ensuring requests made with a Token are traceable to the *original user* in logs/traces.

## Starter Template Evaluation

### Primary Technology Domain
**Brownfield Integration (Full Stack)**
This is a feature enhancement within the existing **OpenCTI Platform**. No new project initialization is required.

### Architecture Foundation (Existing)

**Backend:**
*   **Runtime:** Node.js
*   **API:** GraphQL (Apollo Server)
*   **Database:** ElasticSearch (Data) + Redis (Cache/Sessions)
*   **Auth:** Passport.js strategies

**Frontend:**
*   **Framework:** React
*   **Data Fetching:** Relay (GraphQL)
*   **UI Library:** Material UI (MUI) V5
*   **State:** Local state + Relay Store

**Implication:**
All architectural decisions must explicitly conform to these established patterns. "Clean Slate" decisions are not applicable.

## Core Architectural Decisions

### Decision Priority Analysis
**Critical Decisions (Block Implementation):**
1.  **Token Storage Strategy:** ElasticSearch vs Redis.
2.  **Authentication Integration:** Custom Middleware vs Existing Hook.
3.  **Hash Algorithm:** Native vs Library.

### Data Architecture
*   **Storage Source of Truth:** `ElasticSearch` embedded `tokens` attribute on `User` entity.
    *   *Rationale:* Simplifies the conceptual model. Tokens are strictly owned by users. Extending the existing `User` schema avoids creating a new top-level index and simplifies deletion (cascading delete is automatic).
*   **Read-Path Lookup:** **Internal User Cache**.
    *   *Rationale:* To meet the <10ms overhead requirement, we leverage the existing `platformUsers` cache (populated and managed in `database/cache.ts`). Every active token hash will be an index in this cache.
*   **Performance (Last Used):** **Redis Ephemeral Storage (No Persistence)**.
    *   *Rationale:* To avoid heavy ES writes on every request (NFR-005), the `last_used` timestamp is stored **exclusively** in Redis (key: `token_usage:<hash>`).
    *   *Peristence:* **None**. We accept that `last_used` information is ephemeral and may be lost on Redis restart/flush.
*   **Migration Strategy:** Lazy Migration + Background Job.
    *   *Rationale:* We cannot "pause" the platform. We will run a background script to hash existing tokens while allowing a graceful fallback period.

### Authentication & Security
*   **Integration Point:** **Direct Method Updates**.
    *   **Logic hook:** Modify `authenticateUserByTokenOrUserId` in `src/domain/user.js`.
    *   **Hashing at Entry:** The incoming token (if prefixed with `flgrn_octi_tkn_`) must be hashed using SHA256 before lookup.
    *   **Logic:**
        1.  Extract token from Bearer/Basic Auth.
        2.  Check if it matches the new token prefix.
        3.  Hash the token.
        4.  Search in the `platformUsers` cache (indexed by hash).
    *   **Rationale:** Keeps the core auth logic centralized and ensures zero-knowledge validation even during the lookup phase.
*   **Cryptography:** `Node.js native crypto`.
    *   **Algorithms:**
        *   Generator: `crypto.randomBytes(32)` (CSPRNG).
        *   Hash: `crypto.createHash('sha256')` (Fast, secure enough for high-entropy tokens).
        *   Comparison: `crypto.timingSafeEqual` (Used for supplemental validation if needed).

### API & Communication Patterns
*   **Transport:** HTTP Header `Authorization: Bearer <token>`.
*   **Revocation Logic:**
    *   Active Revocation = "Remove from internal user cache" + "Remove from User entity in ES".
    *   Check Order: 1. Internal User Cache -> 2. (If Miss) ES Lookup -> 3. Hash Validation -> 4. Cache Result.

### Infrastructure & Deployment
*   **Zero-Downtime:** The migration script must be idempotent and run as a post-deployment database migration.
*   **Migration Pattern:** Follow existing OpenCTI migration pattern in `src/migrations/`:
    *   Create timestamped migration file (e.g., `TIMESTAMP-migrate-api-tokens.js`)
    *   Export `up` and `down` functions
    *   Use `executionContext('migration')` and `SYSTEM_USER`
    *   Use `elRawUpdateByQuery` for bulk ElasticSearch updates with Painless scripts
    *   Log progress with `logApp.info` for observability
    *   Handle errors with `DatabaseError` wrapper
    *   Set `wait_for_completion: true` and `refresh: true` for consistency


## Implementation Patterns & Consistency Rules

### Pattern Categories Defined
**Foundational Principle:** Adhere to existing OpenCTI codebases patterns.

### Naming Patterns
*   **Database (ElasticSearch):** `tokens` (Array of Objects) nested in User. Fields: `id`, `name`, `issuer`, `created`, `duration`, `expiry`, `revoked`.
*   **Cache Strategy:** Multi-indexed `platformUsers` Map (internal memory).
*   **React Components:** `PascalCase` (e.g., `TokenCreationDrawer`).
*   **Variables/Functions:** `camelCase` (e.g., `generateToken`, `revokeToken`).
*   **Token Prefix:** **Strictly** `flgrn_octi_tkn_`.

### Structure Patterns
*   **Backend Resolver:** `src/domain/user.js` (or `token.js` if separating). Logic must reside in `domain/` layer, not directly in resolvers.
*   **Frontend Components:** `opencti-front/src/private/components/profile/Token*.tsx`.
*   **Tests:** Co-located `__tests__` or side-by-side spec files (follow repo standard).

### Process Patterns
*   **Cache Management (`database/cache.ts`):** 
    *   Update `buildStoreEntityMap` for `ENTITY_TYPE_USER`.
    *   Instead of a single `api_token` key, iterate over the new `tokens` array and index the user entity by **every** active token hash.
*   **Error Handling:** Throw `FunctionalError` (native OpenCTI error) for business logic failures (e.g., "Invalid Duration"). Throw `AuthenticationError` for validation failures.
*   **Loading States:** Use `React.Suspense` or `isLoading` prop from Relay hooks.
*   **Audit Logging:** Use the global `logAudit` helper. Must include: `ACTOR_ID`, `EVENT_TYPE` (REVOKE/CREATE), `STATUS` (SUCCESS).

## Enforcement Guidelines
*   **Strict Typing:** Use generated GraphQL types for all frontend data.
*   **No "Magic Strings":** Constants for expiration constraints (e.g., `DURATION_30_DAYS`) must be defined in a shared constants file.

## Project Structure & Boundaries

### Feature File Map
This feature spans the Monorepo. Use this map for implementation:

#### Frontend (`opencti-front`)
```
opencti-front/src/
├── private/components/profile/
│   ├── TokenCreationDrawer.tsx   # [NEW] Drawer & Form
│   ├── TokenList.tsx             # [NEW] DataTable
│   ├── TokenLines.tsx            # [NEW] Pagination Lines
│   └── ProfileTokens.tsx         # [NEW] Container
└── utils/
    └── TokenUtils.ts             # [NEW] Formatting/Helpers
```

#### Backend (`opencti-graphql`)
```
opencti-graphql/src/
├── domain/
│   └── user.js                   # [MODIFY] Add generate/revoke logic
├── resolvers/
│   └── user.js                   # [MODIFY] Expose mutations
├── database/
│   ├── elasticsearch.js          # [REF] Index definitions
│   └── redis.js                  # [REF] Cache strategies
└── schema/
    └── user.graphql              # [MODIFY] Add Token types
```

### Architectural Boundaries
*   **API Boundary:**
    *   **Public:** `Authorization: Bearer <token>` (HTTP Header).
    *   **Internal:** `context.user` (injected by passport).
*   **Data Boundary:**
*   **Data Boundary:**
    *   **Tokens:** Stored in ES as nested objects `tokens` within the User entity. (Decision: **Nested Attribute** replacement of existing single-token field).
    *   **Secrets:** Plaintext token never leaves the `generateToken` function scope except for the return value of that specific mutation.

### Integration Points
*   **Audit Subsystem:** `logAudit` called synchronously within business logic.
*   **Auth Subsystem:** `passport.use('bearer', ...)` implementation in `config/passport-http-bearer.js` (or similar) will need refactoring to include the Token Lookup logic.

## Architecture Validation Results

### Coherence Validation ✅
*   **Decision Compatibility:** Native Crypto + ElasticSearch + Custom Middleware form a coherent high-performance secure stack.
*   **Pattern Consistency:** Usage of standard OpenCTI patterns (Relay, Hooks) ensures seamless ongoing maintenance.

### Requirements Coverage Validation ✅
*   **Epic/Feature Coverage:**
    *   *Token Gen/Revoke:* Covered by `User.js` domain logic updates.
    *   *Admin View:* Covered by ES Indexing strategy.
*   **Functional Requirements:**
    *   *FR-004 (One-Time View):* Supported by API boundary definitions (plaintext only returned once).
    *   *FR-014 (Encrypted Storage):* Supported by SHA256 native hashing decision.
*   **Non-Functional Requirements:**
    *   **NFR-005 (Latency):** Addressed by internal user caching layer (`platformUsers`).

### Architecture Readiness Assessment
**Overall Status:** READY FOR IMPLEMENTATION
**Confidence Level:** High
**Key Strengths:** Low footprint, leverages robust existing infrastructure (ES/Internal Cache), zero-dependency approach (Native Crypto).

### Implementation Handoff
**AI Agent Guidelines:**
*   Do not deviate from the `flgrn_octi_tkn_` prefix.
*   Ensure the `TokenCreationDrawer` is strictly composed of existing MUI atoms.

## Architecture Completion Summary

### Final Architecture Deliverables
*   **Decisions:** 3 Critical High-Level decisions (Auth Strategy, Storage, Crypto) made.
*   **Patterns:** 3 Key Pattern Categories (Naming, Structure, Process) mapped to existing codebase.
*   **Structure:** 1 Core Feature Map bridging Frontend and Backend.

### Project Success Factors
*   **Integration Focus:** The architecture prioritizes integrating into the existing "Brownfield" environment rather than reinventing wheels, ensuring maintainability.
*   **Security First:** The decision to use native crypto and separate ES indices prioritizes long-term security and scale.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅
**Document Maintenance:** This document is now the technical source of truth for the API Token Management feature.







