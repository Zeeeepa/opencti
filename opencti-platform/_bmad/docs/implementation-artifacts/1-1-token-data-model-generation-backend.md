# Story 1.1: Token Data Model & Generation Backend

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the backend to generate and store API tokens securely,
So that users can create tokens via the API.

## Acceptance Criteria

1. **Given** the User entity exists in ElasticSearch
   **When** a token generation request is received
   **Then** the system generates a token with format `flgrn_octi_tkn_[A-Za-z0-9]{64}` using Node.js `crypto.randomBytes`
   **And** the token is hashed using SHA-256 before storage
   **And** a masked version of the token (e.g., `****a1b2`) is generated
   **And** the token object (hash, masked_token, created_at, expires_at) is added to the User's `tokens` array in ElasticSearch
   **And** the plaintext token is returned ONLY in the API response

## Tasks / Subtasks

- [ ] Task 1: Extend User entity schema with tokens array (AC: #1)
  - [ ] Add `tokens` array field to User entity schema in ElasticSearch
  - [ ] Define token object structure: `{ hash: string, masked_token: string, created_at: date, expires_at: date, description?: string }`
  - [ ] Update User entity mapping in `src/database/` to support nested token objects
  
- [ ] Task 2: Implement secure token generation function (AC: #1)
  - [ ] Create `generateApiToken()` function in `src/domain/user.js`
  - [ ] Use `crypto.randomBytes(48)` to generate 64-char base64url string
  - [ ] Enforce `flgrn_octi_tkn_` prefix format
  - [ ] Hash token with SHA-256 using `crypto.createHash('sha256')`
  - [ ] Generate masked token (last 4 chars prefixed with `****`)
  - [ ] Return plaintext, hash, and masked_token
  
- [ ] Task 3: Create GraphQL mutation for token generation (AC: #1)
  - [ ] Add `userTokenAdd` mutation to `src/graphql/user.graphql`
  - [ ] Mutation input: `{ duration: enum(30d, 60d, 90d, unlimited), description?: string }`
  - [ ] Mutation output: `{ plaintext_token: string!, token_id: string!, expires_at: date }`
  - [ ] Resolver delegates to `domain/user.js:addUserToken()`
  
- [ ] Task 4: Implement token storage logic (AC: #1)
  - [ ] Create `addUserToken()` function in `src/domain/user.js`
  - [ ] Calculate `expires_at` based on duration using Luxon (NOT Moment.js)
  - [ ] Store token object (hash and masked_token, NOT plaintext) in User's `tokens` array
  - [ ] Use `patchAttribute()` from `src/database/middleware.js` to update User entity
  - [ ] Return plaintext token ONLY in mutation response
  
- [ ] Task 5: Add audit logging for token creation (AC: #1)
  - [ ] Log token generation event to audit subsystem
  - [ ] Include: Actor (user_id), Event (token_generated), TokenID (last 4 chars of plaintext), Timestamp
  - [ ] Use existing OpenCTI audit logging patterns

## Dev Notes

### Critical Implementation Rules

**From project-context.md:**
- **NO RAMDA**: Use pure JavaScript/TypeScript ES6+ features
- **Date Handling**: Use `Luxon` for all date/time operations (NOT Moment.js)
- **Async/Await**: Strict usage, avoid `.then()` chains
- **Error Handling**: Throw `FunctionalError` for business logic errors
- **Backend Resolvers**: Logic must NOT be in resolvers - delegate to `domain/` functions
- **Commits**: Format as `[backend] Add token generation support (#IssueNumber)`

**Security Requirements:**
- **Zero-Knowledge**: NEVER store plaintext tokens - only SHA-256 hashes
- **Zero-Logging**: NEVER log plaintext tokens in application logs
- **One-Time Disclosure**: Return plaintext token ONLY in mutation response
- **CSPRNG**: Use `crypto.randomBytes()` for cryptographically secure generation

### Architecture Patterns

**From architecture.md:**
- **Data Model**: Extend User entity in ElasticSearch with `tokens` array (nested objects)
- **Token Format**: Strictly `flgrn_octi_tkn_[A-Za-z0-9]{64}`
- **Hashing**: Use Node.js native `crypto.createHash('sha256')` (NOT external library)
- **Storage**: Use `patchAttribute()` from `database/middleware.js` to update User entity
- **No Direct DB Access**: Use `database/` adaptors, NEVER call ElasticSearch directly from resolvers

### Project Structure Notes

**Files to Create/Modify:**
- `src/domain/user.js` - Add `generateApiToken()` and `addUserToken()` functions
- `src/graphql/user.graphql` - Add `userTokenAdd` mutation
- `src/resolvers/user.js` - Add resolver for `userTokenAdd` (delegates to domain)
- `src/schema/internalObject.js` - Update User entity schema if needed

**Naming Conventions:**
- Files: `camelCase.js` (Backend)
- GraphQL: `snake_case` for fields, `PascalCase` for Types
- Functions: `camelCase` (e.g., `generateApiToken`, `addUserToken`)

### Testing Standards Summary

**Unit Tests (Vitest):**
- Test `generateApiToken()` function:
  - Verify token format matches `flgrn_octi_tkn_[A-Za-z0-9]{64}`
  - Verify SHA-256 hash is generated correctly
  - Verify plaintext and hash are both returned
- Test `addUserToken()` function:
  - Mock ElasticSearch calls with `vi.mock()`
  - Verify token object structure
  - Verify expiration calculation with Luxon
  - Verify plaintext is NOT stored

**Integration Tests:**
- Test `userTokenAdd` mutation end-to-end
- Verify token is stored in User entity
- Verify plaintext token is returned in response
- Verify audit log entry is created

### References

- **PRD**: [Source: _bmad-output/planning-artifacts/prd.md#Functional Requirements FR-001 to FR-006]
- **Architecture**: [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture, #Authentication & Security]
- **Project Context**: [Source: project-context.md#Language-Specific Rules, #Critical Don't-Miss Rules]
- **Epic**: [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Self-Service Token Management]

### Implementation Guardrails

**Common LLM Mistakes to Avoid:**
1. ❌ Using `Ramda` functions → ✅ Use pure JS/TS (map, filter, reduce)
2. ❌ Using `Moment.js` for dates → ✅ Use `Luxon`
3. ❌ Storing plaintext tokens → ✅ Store SHA-256 hashes only
4. ❌ Logging tokens → ✅ NEVER log plaintext tokens
5. ❌ Direct ElasticSearch calls → ✅ Use `database/middleware.js` adaptors
6. ❌ Logic in resolvers → ✅ Delegate to `domain/user.js` functions
7. ❌ Using external crypto libraries → ✅ Use Node.js native `crypto` module

**Critical Security Checks:**
- [ ] Plaintext token is NEVER stored in database
- [ ] Plaintext token is NEVER logged
- [ ] Token generation uses CSPRNG (`crypto.randomBytes`)
- [ ] Token format strictly matches `flgrn_octi_tkn_[A-Za-z0-9]{64}`
- [ ] SHA-256 hashing is applied before storage
- [ ] Audit log entry is created for token generation

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
