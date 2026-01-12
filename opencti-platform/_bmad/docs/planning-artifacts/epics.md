---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['prd.md', 'architecture.md', 'ux-design-specification.md']
status: 'complete'
---

# opencti-platform - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for opencti-platform, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR-001:** Users can generate a new API token from their profile.
- **FR-002:** Users must select an expiration duration during generation (30, 60, 90 days, or Unlimited).
- **FR-003:** The system must generate a token compliant with `flgrn_octi_tkn_[A-Za-z0-9]{64}` using a CSPRNG.
- **FR-004:** The system must display the full plaintext token **exactly once** in a modal immediately after generation.
- **FR-005:** Users must be able to copy the token value to the clipboard.
- **FR-006:** Once the modal is closed, the system must never display the plaintext token again.
- **FR-101 (Masked Storage):** The system must generate and store a masked version of the token (e.g., `****a1b2`) at creation time to enable identification without retaining the full secret.
- **FR-007:** Users can view a list of their own active and revoked tokens.
- **FR-008:** The list must display the **last 4 characters** of each token for identification.
- **FR-009:** The list must display the **Creation Date**, **Expiration Date**, and **Last Used Date** for each token.
- **FR-010:** Users can revoke (delete/invalidate) any of their own active tokens.
- **FR-011:** Revocation must take effect immediately for all subsequent API requests.
- **FR-012:** Administrators can view the list of tokens for **any** user in the system.
- **FR-013:** Administrators can revoke tokens for **any** user.
- **FR-014:** The system must store all tokens in an encrypted/hashed format in the database (SHA-256) AND a separate masked value for display. Plaintext tokens must NEVER be stored.
- **FR-015:** The system must validate tokens using constant-time comparison to prevent timing attacks.
- **FR-016:** The system must reject any token that matches a revoked status.
- **FR-017:** The system must reject any token that has passed its expiration date.
- **FR-018:** The system must bypass MFA checks for valid token-based API authentication.
- **FR-019:** The system must create an immutable audit log entry for every token generation event.
- **FR-020:** The system must create an immutable audit log entry for every token revocation event (including Actor, Subject, TokenID).

### Non-Functional Requirements

- **NFR-001 (Cryptography):** Token generation must use a CSPRNG available in the backend runtime.
- **NFR-002 (Storage):** Token storage must use SHA-256 hashing (optimized for high-entropy credentials).
- **NFR-003 (Leakage Prevention):** Token values must not reside in memory longer than the request lifecycle.
- **NFR-004 (Comparison):** Validation must strictly use **constant-time** string comparison.
- **NFR-005 (Latency):** The token validation process must add less than **10ms** overhead to API request time.
- **NFR-006 (Compatibility):** The implementation must coexist with 100% of existing API clients without requiring client-side code changes.

### Additional Requirements

**From Architecture:**
- **Brownfield Integration:** No new project initialization. Feature enhancement within existing OpenCTI Platform.
- **Internal User Cache:** Leverage existing `platformUsers` cache (managed in `database/cache.ts`) for <10ms validation.
- **Authentication Hook:** Modify `authenticateUserByTokenOrUserId` in `src/domain/user.js` for token hashing at entry.
- **Data Model:** Extend `User` entity in ElasticSearch with `tokens` array attribute (nested objects).
- **Migration Strategy:** Zero-downtime lazy migration + background job to hash existing tokens.
- **Token Prefix Enforcement:** Strictly `flgrn_octi_tkn_` format.
- **No Ramda:** Use pure JavaScript/TypeScript ES6+ features.
- **Date Handling:** Use Luxon (not Moment.js).
- **Commit Format:** `[frontend|backend] Message (#IssueNumber)`.

**From UX Design:**
- **Component Reuse:** Strict adherence to MUI V5 components (no custom components).
- **Drawer Pattern:** Use `<Drawer anchor="right">` for token creation (matches OpenCTI entity creation pattern).
- **ItemCopy Component:** Use existing `<ItemCopy variant="inLine" />` for secure copy interaction.
- **Dense Tables:** Use `size="small"` on Tables to match OpenCTI admin density.
- **Accessibility:** WCAG 2.1 AA compliance, focus management, ARIA labels.
- **Token Reveal:** Dedicated "Success State" within Drawer after submission (one-time view).
- **Revocation Confirmation:** Use `<Dialog>` with explicit confirmation to prevent accidental deletion.
- **Visual Feedback:** "Copied!" toast/tooltip, expiration warnings (yellow/red for <7 days).

### FR Coverage Map

- **FR-001** (Generate token from profile) → Epic 1
- **FR-002** (Select expiration duration) → Epic 1
- **FR-003** (CSPRNG token generation) → Epic 1
- **FR-004** (One-time plaintext display) → Epic 1
- **FR-005** (Copy to clipboard) → Epic 1
- **FR-006** (Never show again) → Epic 1
- **FR-007** (View own token list) → Epic 1
- **FR-008** (Display last 4 chars) → Epic 1
- **FR-009** (Display dates) → Epic 1
- **FR-010** (User revocation) → Epic 1
- **FR-011** (Immediate revocation effect) → Epic 1
- **FR-101** (Masked Storage) → Epic 1
- **FR-012** (Admin view all tokens) → Epic 3
- **FR-013** (Admin revoke any token) → Epic 3
- **FR-014** (Encrypted storage) → Epic 2
- **FR-015** (Constant-time validation) → Epic 2
- **FR-016** (Reject revoked tokens) → Epic 2
- **FR-017** (Reject expired tokens) → Epic 2
- **FR-018** (MFA bypass for tokens) → Epic 2
- **FR-019** (Audit log generation) → Epic 3
- **FR-020** (Audit log revocation) → Epic 3

**NFR Coverage:**
- **NFR-001** (CSPRNG) → Epic 2
- **NFR-002** (SHA-256 storage) → Epic 2
- **NFR-003** (Memory leakage prevention) → Epic 2
- **NFR-004** (Constant-time comparison) → Epic 2
- **NFR-005** (Latency <10ms) → Epic 2
- **NFR-006** (Client compatibility) → Epic 2

## Epic List

### Epic 1: Self-Service Token Management
Users can autonomously generate, view, and revoke their own API tokens with clear visibility into token lifecycle.

**FRs Covered:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011

**User Value:** Enables analysts and developers to create and manage their own API credentials without admin intervention, supporting automation and integration workflows.

**Implementation Notes:**
- Frontend: MUI Drawer pattern for creation, dense Table for list view, ItemCopy component for secure copy
- Backend: Token generation with CSPRNG, ElasticSearch User entity extension with `tokens` array
- UX: One-time view modal, "Copied!" feedback, revocation confirmation dialog

---

### Epic 2: Secure Token Authentication & Migration
API tokens work securely for all API requests with zero-knowledge storage and constant-time validation. Existing tokens are migrated without service disruption.

**FRs Covered:** FR-014, FR-015, FR-016, FR-017, FR-018

**NFRs Covered:** NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-006

**User Value:** Ensures all API authentication is cryptographically secure, prevents timing attacks, and maintains backward compatibility with existing integrations.

**Implementation Notes:**
- Backend: Modify `authenticateUserByTokenOrUserId` in `src/domain/user.js` for SHA-256 hashing at entry
- Cache: Update `database/cache.ts` to index `platformUsers` by token hash (multi-token support)
- Migration: Zero-downtime background script to hash existing UUID tokens
- Security: No Ramda (pure JS/TS), Luxon for dates, constant-time comparison

---

### Epic 3: Administrative Token Oversight
Administrators can view and revoke tokens for any user in the system, with complete audit trails for compliance.

**FRs Covered:** FR-012, FR-013, FR-019, FR-020

**User Value:** Enables security teams to respond to incidents (stolen laptops, compromised credentials) with immediate token revocation and full audit visibility.

**Implementation Notes:**
- Frontend: Admin-specific token list view (all users), revocation controls
- Backend: Audit logging for all token lifecycle events (generation, revocation)
- Security: Immutable audit trail with Actor, Subject, TokenID, Timestamp

---

## Epic 1: Self-Service Token Management

Users can autonomously generate, view, and revoke their own API tokens with clear visibility into token lifecycle.

### Story 1.1: Token Data Model & Generation Backend

As a developer,
I want the backend to generate and store API tokens securely,
So that users can create tokens via the API.

**Acceptance Criteria:**

**Given** the User entity exists in ElasticSearch
**When** a token generation request is received
**Then** the system generates a token with format `flgrn_octi_tkn_[A-Za-z0-9]{64}` using Node.js `crypto.randomBytes`
**And** the token is hashed using SHA-256 before storage
**And** a masked version of the token (e.g., `****a1b2`) is generated
**And** the token object (hash, masked_token, created_at, expires_at, last_used) is added to the User's `tokens` array in ElasticSearch
**And** the plaintext token is returned ONLY in the API response

### Story 1.2: Token List & Revocation Backend

As a user,
I want to view and revoke my own tokens via API,
So that I can manage my credentials programmatically.

**Acceptance Criteria:**

**Given** a user has tokens stored in their User entity
**When** the user requests their token list
**Then** the system returns all tokens with last 4 characters, creation date, expiration date, and last used date
**And** plaintext values are NEVER returned
**When** the user requests token revocation
**Then** the token is removed from the User's `tokens` array
**And** the token hash is removed from the `platformUsers` cache
**And** subsequent API requests with that token are rejected immediately

### Story 1.3: Token Creation UI (Drawer & Form)

As a user,
I want a UI to create new API tokens,
So that I can generate credentials without using the API directly.

**Acceptance Criteria:**

**Given** the user is on their Profile page
**When** they click "Generate Token"
**Then** a MUI Drawer opens from the right
**And** the form includes a Select for duration (30, 60, 90 days, Unlimited)
**And** the form includes an optional TextField for token description/label
**When** they submit the form
**Then** the API is called to generate the token
**And** the Drawer content swaps to the "One-Time View" state

### Story 1.4: One-Time Token Display & Secure Copy

As a user,
I want to see and copy my new token exactly once,
So that I can securely store it in my secrets manager.

**Acceptance Criteria:**

**Given** a token has just been generated
**When** the Drawer shows the "One-Time View" state
**Then** the plaintext token is displayed using the `ItemCopy` component
**And** focus is programmatically moved to the Copy button (accessibility)
**When** the user clicks the Copy button
**Then** the token is copied to clipboard
**And** a "Copied!" toast/tooltip appears
**And** the Copy icon changes to a Success checkmark
**When** the user closes the Drawer
**Then** the plaintext token is never retrievable again

### Story 1.5: Token List View (User Profile)

As a user,
I want to see all my active and revoked tokens in a table,
So that I can track my API credentials.

**Acceptance Criteria:**

**Given** the user is on their Profile page
**When** the page loads
**Then** a dense MUI Table displays all tokens
**And** each row shows: Last 4 chars, Creation Date, Expiration Date, Last Used Date, Revoke button
**And** tokens expiring in <7 days show a warning indicator (yellow/orange)
**And** expired tokens show an error indicator (red)
**When** no tokens exist
**Then** an empty state message is displayed: "No tokens found. Click + to generate one."

### Story 1.6: Token Revocation UI (Confirmation Dialog)

As a user,
I want to revoke a specific token with confirmation,
So that I don't accidentally break my integrations.

**Acceptance Criteria:**

**Given** the user is viewing their token list
**When** they click the Revoke (trash) icon
**Then** a MUI Dialog opens with a confirmation message
**And** the message includes the token's last 4 chars and description/label
**And** the message warns: "Any scripts using this token will stop working immediately."
**When** the user confirms
**Then** the revocation API is called
**And** the token is removed from the list
**And** a success Snackbar appears: "Token revoked successfully"
**When** the user cancels
**Then** the Dialog closes with no action

---

## Epic 2: Secure Token Authentication & Migration

API tokens work securely for all API requests with zero-knowledge storage and constant-time validation. Existing tokens are migrated without service disruption.

### Story 2.1: Authentication Middleware Integration

As a developer,
I want the authentication system to validate new token format,
So that API requests using tokens are properly authenticated.

**Acceptance Criteria:**

**Given** a request contains `Authorization: Bearer flgrn_octi_tkn_...`
**When** `authenticateUserByTokenOrUserId` is called in `src/domain/user.js`
**Then** the token is hashed using SHA-256
**And** the hash is looked up in the `platformUsers` cache
**And** if found, the user is authenticated
**And** if not found in cache, ElasticSearch is queried for the User with matching token hash
**And** the validation uses constant-time comparison (`crypto.timingSafeEqual`)
**And** MFA checks are bypassed for valid token authentication (FR-018)
**And** the `last_used` timestamp for the specific token is updated in Redis (ephemeral storage)
**And** the `ApiToken` GraphQL type exposes a `last_used` field, resolved by fetching from Redis
**And** the Token List UI (from Story 1.5) is updated to display this `last_used` data

### Story 2.2: Internal Cache Multi-Token Indexing

As a developer,
I want the internal user cache to index users by all their token hashes,
So that token validation achieves <10ms latency.

**Acceptance Criteria:**

**Given** the `platformUsers` cache exists in `database/cache.ts`
**When** `buildStoreEntityMap` is called for User entities
**Then** for each user with a `tokens` array
**And** for each token in the array, the user is indexed by the token's hash
**And** the cache supports multiple token hashes per user
**And** token hash lookups return the user object in <10ms (NFR-005)

### Story 2.3: Token Expiration & Revocation Validation

As a system,
I want to reject expired and revoked tokens,
So that compromised or outdated credentials cannot be used.

**Acceptance Criteria:**

**Given** a token is being validated
**When** the token is found in the cache or database
**Then** the system checks if `expires_at` is in the past using Luxon
**And** if expired, the request is rejected with `401 Unauthorized (Token Expired)`
**When** the token hash is not found in the User's `tokens` array
**Then** the request is rejected with `401 Unauthorized (Token Revoked)`
**And** revocation takes effect immediately (cache invalidation)

### Story 2.4: Legacy Token Migration Script

As a platform administrator,
I want existing UUID tokens to be migrated to the new hashed format,
So that all users can continue using their existing credentials.

**Acceptance Criteria:**

**Given** users have existing `api_token` (UUID format) in their User entities
**When** the migration script runs following the OpenCTI migration pattern
**Then** a timestamped migration file is created in `src/migrations/` (e.g., `TIMESTAMP-migrate-api-tokens.js`)
**And** the script exports `up` and `down` functions
**And** the `up` function uses `executionContext('migration')` and `SYSTEM_USER`
**And** for each user with an `api_token`, an `elRawUpdateByQuery` Painless script:
  - Hashes the UUID token using SHA-256
  - Creates a new token object in the `tokens` array with the hash
  - Preserves the original `api_token` field temporarily for backward compatibility
**And** the migration uses `wait_for_completion: true` and `refresh: true`
**And** progress is logged with `logApp.info('[MIGRATION] Migrating API tokens')`
**And** errors are wrapped with `DatabaseError`
**And** the migration is idempotent (can be run multiple times safely)
**And** the migration runs as a zero-downtime background job

---

## Epic 3: Administrative Token Oversight

Administrators can view and revoke tokens for any user in the system, with complete audit trails for compliance.

### Story 3.1: Admin Token List View (All Users)

As an administrator,
I want to view tokens for any user in the system,
So that I can audit API access across the platform.

**Acceptance Criteria:**

**Given** the admin is in Settings > Users > [User] section
**When** they navigate to the "Tokens" tab
**Then** a dense MUI Table displays all tokens for that user
**And** the table shows: Last 4 chars, Creation Date, Expiration Date, Last Used Date, Revoke button
**And** the admin can see tokens for any user (not just their own)
**And** the UI reuses the same Table component from Epic 1 Story 1.5

### Story 3.2: Admin Token Revocation

As an administrator,
I want to revoke any user's token,
So that I can respond to security incidents immediately.

**Acceptance Criteria:**

**Given** the admin is viewing a user's token list
**When** they click the Revoke (trash) icon
**Then** a MUI Dialog opens with confirmation
**And** the message includes: User name, Token last 4 chars, Warning about breaking integrations
**When** the admin confirms
**Then** the revocation API is called with admin context
**And** the token is removed from the user's `tokens` array
**And** the token hash is removed from the `platformUsers` cache
**And** an audit log entry is created (FR-020)

### Story 3.3: Audit Logging for Token Lifecycle

As a compliance officer,
I want all token events logged immutably,
So that I can track credential usage for audits.

**Acceptance Criteria:**

**Given** a token generation event occurs
**When** the token is created
**Then** an immutable audit log entry is created with: Actor (user who created), Subject (user ID), Event (token_generated), TokenID (last 4 chars), Timestamp
**Given** a token revocation event occurs
**When** the token is revoked
**Then** an immutable audit log entry is created with: Actor (who revoked), Subject (token owner), Event (token_revoked), TokenID (last 4 chars), Timestamp, Reason (if provided)
**And** audit logs use the existing OpenCTI audit subsystem
**And** audit entries are tamper-evident
