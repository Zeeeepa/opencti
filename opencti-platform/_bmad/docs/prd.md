---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-e-01-discovery', 'step-e-02-review', 'step-e-03-edit']
classification:
  projectType: 'saas_b2b'
  domain: 'cybersecurity'
  complexity: 'high'
  projectContext: 'brownfield'
inputDocuments: []
workflowType: 'prd'
workflow: 'edit'
lastEdited: '2026-01-12'
editHistory:
  - date: '2026-01-12'
    changes: 'Added Out of Scope section, updated FRs for masked token storage, added Glossary.'
---

# Product Requirements Document - opencti-platform

**Author:** Filigran
**Date:** 2026-01-11

## Executive Summary

The OpenCTI API Token Management feature aims to empower users with autonomous, secure control over their API access credentials while eliminating security risks associated with plaintext tokens. By introducing self-service generation, granular expiration controls, and immediate revocation capabilities, this feature aligns with strict zero-trust security policies and compliance requirements. The solution prioritizes a seamless user experience for analysts and developers while enforcing rigorous backend security standards including CSPRNG generation and constant-time validation.


## Success Criteria

### User Success

*   **Autonomy:** Users can generate, view, and revoke their own API tokens on demand without admin assistance.
*   **Visibility:** Users can clearly see token availability, with immediate access to creation date, expiration date, and last usage time.
*   **Security Confidence:** Users have assurance that their tokens are managed securely, with the ability to identify them easily via the last 4 characters.
*   **Secure Access:** Users acknowledge that they can only see the standard token value **once** at creation time, enforcing secure storage practices.

### Business Success

*   **Security Compliance:** Elimination of "plaintext token" findings in security audits and strict adherence to zero-logging policies.
*   **Integration Enablement:** Facilitate secure machine-to-machine (M2M) integrations by allowing dedicated, rotatable tokens with defined lifecycles.
*   **Risk Reduction:** Capability to immediately revoke compromised credentials without full account resets.

### Technical Success

*   **Token Standard:** Enforce strict token format: `flgrn_octi_tkn_[A-Za-z0-9]{64}`.
*   **Secure Implementation:**
    *   **Generation:** Use a cryptographically secure pseudo-random number generator (CSPRNG).
    *   **Validation:** Use constant-time comparison algorithms to prevent timing attacks.
    *   **Zero-Logging:** Cleartext token values must **NEVER** be logged in application logs, audit trails, or traces.
*   **One-Time Disclosure:** The system must return the plain-text token **only** in the API response immediately following creation. Subsequent requests must never be able to retrieve it.
*   **Zero-Downtime Migration:** Seamless backend process to encrypt all existing user tokens without service interruption.
*   **Performance:** No noticeable latency impact on API authentication despite encryption/decryption overhead.

### Measurable Outcomes

*   **100%** of existing tokens migrated to encrypted storage.
*   **0** plaintext tokens remaining in the database or logs.
*   **100%** of new tokens comply with the `flgrn_octi_tkn_` format.
*   **Availability** of granular revocation capabilities for all users.

## Product Scope

### MVP - Minimum Viable Product

*   **Backend Migration:** Script and process to encrypt all existing tokens in the database to the new secure format.
*   **Token Generation:**
    *   Generate secure tokens using CSPRNG.
    *   Enforce format: `flgrn_octi_tkn_[A-Za-z0-9]{64}`.
    *   Expiration selection: **30 days, 60 days, 90 days, or Unlimited**.
    *   **One-Time View:** Modal to show token once, with "Copy" and warning that it won't be seen again.
*   **Token Revocation:** Ability for users to revoke specific tokens immediately.
*   **Token Management Code:**
    *   Implementation of constant-time comparison.
    *   Strict log scrubbing to ensure zero-logging of secrets.
*   **User Interface (List View):**
    *   Display **Last 4 characters** of the token for identification.
    *   Show **Creation Date**, **Expiration Date**, and **Last Used Date**.
    *   Revocation action.

### Growth Features (Post-MVP)

*   **Scope Restrictions:** Limiting tokens to specific API permissions or subsets of data.
*   **Enhanced Analytics:** Detailed usage logs (Source IP, User Agent, Frequency) for each token.

### Explicit Out of Scope

*   **Token Rotation Helpers:** UI/API utilities to assist in rotating keys automatically are not part of MVP.
*   **Leak Detection:** Automated scanning of public repositories (e.g., GitHub) for leaked tokens is out of scope.
*   **Key Rotation:** Automatic master key rotation is not included.

### Vision (Future)

*   **Granular Permissions:** OAuth2-style scopes per token (e.g., `read:reports`, `write:indicators`).
*   **Machine Identities:** First-class support for non-human service accounts separate from user profiles.

## User Journeys

### Journey 1: The Analyst's Long-Term Access (Alice)
**Persona:** Alice, Senior Security Analyst. Needs stable access for her personal enrichment scripts.
**Scenario:** Creating a permanent token for personal tooling.

1.  **Login:** Alice logs into the platform and navigates to "Profile".
2.  **Initiation:** She clicks "Generate new token".
3.  **Configuration:** In the modal, she selects duration: "**Unlimited**" (understanding this is for long-term use).
4.  **Creation:** She clicks "Generate".
5.  **One-Time View (Crucial Moment):** The system displays the token `flgrn_octi_tkn_...` in a modal with a warning: *"Make sure to copy your new personal API token now. You won't be able to see it again!"*
6.  **Secure Storage:** Alice clicks "Copy to clipboard" and pastes it into her secure secrets manager. She clicks "Close".
7.  **Verification:** Back on her profile list, she sees the new token entry:
    *   **Name/ID:** `...a1b2` (Last 4 chars)
    *   **Created:** Just now
    *   **Expires:** Never
    *   **Last Used:** Never
8.  **Outcome:** Alice has secure, autonomous access without bothering IT.

### Journey 2: The Administrator's revocation (Bob)
**Persona:** Bob, Platform Administrator. Responsible for security hygiene.
**Scenario:** Alice reports her laptop was stolen. Bob needs to kill her sessions/tokens immediately.

1.  **Incident:** Bob receives ticket: "Laptop stolen - User: Alice".
2.  **Investigation:** Bob navigates to Settings > Users > Alice > Sessions/Tokens.
3.  **Identification:** He sees Alice has 3 active tokens. He doesn't know which one was on the laptop, so he decides to revoke all to be safe.
4.  **Action:** He clicks the "Revoke" (trash icon) next to each token.
5.  **Confirmation:** System asks "Are you sure? Any scripts using this token will stop working immediately." Bob confirms.
6.  **Outcome:** The tokens effectively vanish from the valid list (or marked revoked). Any request made by the thief using those tokens is rejected in real-time.

### Journey 3: The Integrator's Pipeline (Charlie)
**Persona:** Charlie, DevOps Engineer. Setting up a CI/CD pipeline.
**Scenario:** Needs a temporary token for a one-off data migration script.

1.  **Configuration:** Charlie goes to Profile > Generate Token.
2.  **Selection:** He selects Duration: "**30 Days**" because this migration project only lasts a month.
3.  **Creation:** He generates and copies the token.
4.  **Lifecycle:** The token is used in the pipeline.
5.  **End of Life:** 31 days later, the script tries to run. The API rejects it with `401 Unauthorized (Token Expired)`.
6.  **Outcome:** Charlie doesn't need to remember to clean up the credential—the system handled the security hygiene automatically.

### Journey Requirements Summary
*   **Profile UI:** Needs "Generate", "List", and "Revoke" controls.
*   **Generation Modal:** Needs "Duration Selector" and "One-Time Display" logic.
*   **Admin UI:** Admin users need to see/revoke tokens for *other* users.
*   **Auth Middleware:** Needs to check both validity signature AND expiration date AND revocation status on every request.

## Domain-Specific Requirements

### Compliance & Regulatory
*   **Audit Logging:** STRICT requirement. All token lifecycle events (Creation, Revocation) must be written to the application audit log.
    *   **Revocation Event Details:** Must include Actor (Who revoked), Subject (Which user's token), Token ID (Last 4 chars), Timestamp, and Reason (if applicable).
*   **Future Compliance:** Architecture must allow for future FIPS 140-2 compliance, but it is out of scope for MVP.

### Technical Constraints (Security)
*   **Audit Immutability:** Audit logs for token events should be tamper-evident (handled by existing platform audit system).

### Risk Mitigations
*   **Compromise Handling:** Immediate revocation capability (as defined in MVP) is the primary mitigation for compromised credentials.
*   **Deferred Protections:** Automated leak detection (e.g., GitHub scanning) and Master Key Rotation are explicitly **out of scope** for MVP but documented as future needs.

## SaaS / B2B Platform Requirements

### Project-Type Overview
This feature enhances the core platform authentication layer. It is available to all users (Community & Enterprise) and leverages the existing platform authorization model without introducing new isolation layers.

### Technical Architecture Considerations

#### Authentication & Authorization Model
*   **Permission Inheritance:** Tokens strictly inherit the permissions of the User who created them.
*   **Data Segregation:** Relies entirely on the existing OpenCTI user profile logic (Markings, Organization, ACLs). No additional multi-tenancy logic is required at the token level.
*   **MFA Bypass:** These long-lived tokens explicitly bypass Multi-Factor Authentication (MFA) to enable automated (M2M) API usage.

#### Subscription & Licensing
*   **Availability:** Feature is available to ALL platform users (Community Edition included).
*   **Limits:** No strict limits on number of tokens per user defined for MVP (default to reasonable system limits if any).

### Implementation Considerations
*   **Integration Pattern:** Tokens are designed for direct HTTP Header usage (`Authorization: Bearer <token>`).
*   **Compatibility:** Must work seamlessly with existing API clients by replacing the current static token mechanism transparently.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy
**MVP Approach:** Problem-Solving MVP.
**Goal:** Eliminate security risk (plaintext tokens) and enable autonomy (self-service generation/revocation) with minimum friction.

### MVP Feature Set (Phase 1)
**Must-Have Capabilities:**
*   **Security:** CSPRNG Generation, Constant-time validation, Zero-logging, One-time view.
*   **Backend:** Zero-downtime migration script (Encrypt all).
*   **User UI:** Generate (Duration selection), List (Last 4 chars + statuses), Revoke.
*   **Admin UI:** Revoke user tokens.
*   **Audit:** Log creation/revocation events.

### Post-MVP Features

**Phase 2 (Growth - Usability & Hygiene):**
*   **Scope Restrictions:** Limit tokens to specific permissions.
*   **Token Rotation Helpers:** Tools to assist in rotating keys.
*   **Enhanced Analytics:** Usage frequency and source IP logging.

**Phase 3 (Expansion - Advanced Auth):**
*   **Machine Identities:** Service accounts.
*   **Granular Permissions:** OAuth2-style scoping (`read:report`, `write:entity`).

### Risk Mitigation Strategy
*   **Technical (Migration):** Risk of downtime/lockout. Mitigation: Robust migration script with dry-run mode and rollback capability (if encryption fails, fallback to legacy check momentarily or maintenance window).
*   **Security (Leakage):** Risk of token compromise. Mitigation: Instant revocation capability and audit logging.

## Functional Requirements

### Token Generation
*   **FR-001:** Users can generate a new API token from their profile.
*   **FR-002:** Users must select an expiration duration during generation (30, 60, 90 days, or Unlimited).
*   **FR-003:** The system must generate a token compliant with `flgrn_octi_tkn_[A-Za-z0-9]{64}` using a CSPRNG.
*   **FR-004:** The system must display the full plaintext token **exactly once** in a modal immediately after generation.
*   **FR-005:** Users must be able to copy the token value to the clipboard.

*   **FR-006:** Once the modal is closed, the system must never display the plaintext token again.
*   **FR-101 (Masked Storage):** The system must generate and store a masked version of the token (e.g., `****a1b2`) at creation time to enable identification without retaining the full secret.

### Token Management (User)
*   **FR-007:** Users can view a list of their own active and revoked tokens.
*   **FR-008:** The list must display the **last 4 characters** of each token for identification.
*   **FR-009:** The list must display the **Creation Date**, **Expiration Date**, and **Last Used Date** for each token.
*   **FR-010:** Users can revoke (delete/invalidate) any of their own active tokens.
*   **FR-011:** Revocation must take effect immediately for all subsequent API requests.

### Administration
*   **FR-012:** Administrators can view the list of tokens for **any** user in the system.
*   **FR-013:** Administrators can revoke tokens for **any** user.

### Security & Compliance
*   **FR-014:** The system must store all tokens in an encrypted/hashed format in the database (SHA-256) AND a separate masked value for display. Plaintext tokens must NEVER be stored.
*   **FR-015:** The system must validate tokens using constant-time comparison to prevent timing attacks.
*   **FR-016:** The system must reject any token that matches a revoked status.
*   **FR-017:** The system must reject any token that has passed its expiration date.
*   **FR-018:** The system must bypass MFA checks for valid token-based API authentication.
*   **FR-019:** The system must create an immutable audit log entry for every token generation event.
*   **FR-020:** The system must create an immutable audit log entry for every token revocation event (including Actor, Subject, TokenID).

## Non-Functional Requirements

### Security
*   **NFR-001 (Cryptography):** Token generation must use a CSPRNG available in the backend runtime.
*   **NFR-002 (Storage):** Token storage must use a secure hashing algorithm optimized for high-entropy credentials (e.g., SHA-256/512 or HMAC) to prioritize performance while maintaining security. Slow password-hashing algorithms (like bcrypt) are not required for high-entropy machine tokens.
*   **NFR-003 (Leakage Prevention):** Token values must typically *not* reside in memory longer than the request lifecycle.
*   **NFR-004 (Comparison):** Validation must strictly use **constant-time** string comparison.

### Performance
*   **NFR-005 (Latency):** The token validation process (database lookup + hash comparison) must add less than **10ms** overhead to the API request time compared to existing authentication methods.

### Maintainability
*   **NFR-006 (Compatibility):** The implementation must coexist with 100% of existing API clients without requiring client-side code changes (transparent backend swap).

## Traceability Matrix

| Requirement | Description | User Journey | Success Criteria |
| :--- | :--- | :--- | :--- |
| **FR-001** | Generate token | Journey 1, 3 | User Autonomy |
| **FR-002** | Select expiration | Journey 1, 3 | Risk Reduction |
| **FR-003** | CSPRNG format | N/A | Technical Standard |
| **FR-004** | One-time view | Journey 1 | Secure Access |
| **FR-005** | Copy to clipboard | Journey 1 | User Autonomy |
| **FR-006** | Never show again | Journey 1 | Secure Access |
| **FR-007** | View token list | Journey 1 | Visibility |
| **FR-008** | Show last 4 chars | Journey 1, 2 | Security Confidence |
| **FR-009** | Show dates | Journey 1 | Visibility |
| **FR-010** | User revocation | Journey 2 | User Autonomy |
| **FR-011** | Immediate revocation | Journey 2 | Risk Reduction |
| **FR-012** | Admin view list | Journey 2 | Security Compliance |
| **FR-013** | Admin revocation | Journey 2 | Risk Reduction |
| **FR-014** | Encrypted storage | N/A | Security Compliance |
| **FR-015** | Constant-time check | N/A | Secure Implementation |
| **FR-016** | Revoked rejection | Journey 2 | Security Compliance |
| **FR-017** | Expired rejection | Journey 3 | Risk Reduction |
| **FR-018** | MFA bypass | Journey 3 | Integration Enablement |
| **FR-019** | Audit generation | N/A | Security Compliance |
| **FR-020** | Audit revocation | Journey 2 | Security Compliance |



## Glossary

*   **CSPRNG:** Cryptographically Secure Pseudo-Random Number Generator. A standard for generating numbers that are statistically unpredictable, essential for security tokens.
*   **FIPS 140-2:** Federal Information Processing Standards Publication 140-2. A U.S. government computer security standard used to approve cryptographic modules.
*   **M2M:** Machine-to-Machine. Automated communication between devices or applications where no human intervention is present, typically requiring long-lived API tokens.
*   **Masked Token:** A safe-to-display version of the token (e.g., `****1234`) stored explicitly to allow identification without compromising the actual secret.

