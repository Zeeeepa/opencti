---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-core-experience', 'step-04-emotional-response', 'step-05-inspiration', 'step-06-design-system', 'step-07-defining-experience', 'step-08-visual-foundation', 'step-09-design-directions', 'step-10-user-journeys', 'step-11-component-strategy', 'step-12-ux-patterns', 'step-13-responsive-accessibility', 'step-14-complete']
inputDocuments: ['prd.md']
---

# UX Design Specification - OpenCTI API Token Management

**Author:** Filigran
**Date:** 2026-01-11

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision
To empower OpenCTI users with autonomous, secure control over their API access credentials. The shift from static tokens to a dynamic, self-service model prioritizes **Zero Trust** principles (one-time view, strict expiration) while reducing administrative overhead through self-management.

### Target Users
*   **Alice (Security Analyst):** Non-technical consumer. Needs "set and forget" long-term access for personal scripts. Values clear feedback and stable access.
*   **Bob (Platform Admin):** Hygiene enforcer. Needs efficient tools to inspect and revoke tokens across the entire user base during incidents.
*   **Charlie (DevOps Engineer):** Automation builder. Needs precise control over token lifecycles (short-lived) for CI/CD pipelines.

### Key Design Challenges
1.  **The "One-Time View" Friction:** Balancing high security with usability. We must ensure users don't close the modal before copying without using "scare tactics," implementing clear "Copy" micro-interactions.
2.  **Destructive Revocation:** preventing accidental data/pipeline breakage when revoking tokens, distinguishing between "Expired" (passive) and "Revoked" (active) states.
3.  **Token Identifiability:** Moving beyond "Last 4 chars" to include user-defined **Labels** to allow users to distinguish "Jenkins Prod" from "My Laptop" at a glance.

### Design Opportunities
*   **Confidence in Creation:** Use positive reinforcement (animations, checks) when a token is successfully copied to the clipboard.
*   **Visual Urgency:** Use subtle color coding (Yellow/Red) for tokens nearing expiration to prompt proactive rotation.
*   **Smart Defaults:** Pre-fill reasonable defaults (e.g., Label = "API Token - [Date]") to reduce friction if the user doesn't want to customize.

## Core User Experience

### Defining Experience
The core experience centers on **Intentional Security**. Users engage with the system not casually, but to perform specific, high-stakes authorization tasks. The flow prioritizes clarity and confirmation over raw speed, ensuring users understand the lifecycle of the credentials they are creating.

### Platform Strategy
*   **Primary Platform:** Desktop Web Application.
*   **Mobile Strategy:** Out of scope. The complex nature of API management and admin tasks assumes a desktop environment.
*   **Context:** Improving an existing feature within the OpenCTI platform, ensuring consistency with current UI patterns while elevating the security UX.

### Effortless Interactions
1.  **Selection Clarity:** Instead of defaults, we present clear, distinct choices for duration, ensuring users actively decide their security posture.
2.  **The "Copy" Moment:** A single-click action with immediate, persistent visual feedback ("Copied!" checkmark) provides the necessary confidence to proceed.
3.  **Safe Dismissal:** The modal never auto-closes. The user retains full control to close the window only when they are certain they have secured the token.

### Critical Success Moments
*   **The "Safekeeping" Moment:** unparalleled clarity when the token is displayed. The user must feel 100% confident they have copied the *correct* value before the "Close" button is even considered.
*   **The "Revoke" Decision:** When revoking, the user must instantly understand *which* token is being killed (via Label + Last 4) to prevent operational outages.

### Experience Principles
1.  **Intentionality over Speed:** Force explicit choices (like duration) to prevent accidental security gaps.
2.  **Explicit Confirmation:** Critical actions (Copy, Close, Revoke) require unambiguous user initiation; the system does not guess for the user.
3.  **Desktop-First Precision:** Leverage screen real estate for clear data tables and detailed metadata, optimizing for the analyst's workstation.

## Desired Emotional Response

### Primary Emotional Goals
*   **Confidence:** The user should feel absolutely certain that the token they created is secure, correct, and safely copied.
*   **Relief:** The common anxiety of "did I save it?" should be actively managed and converted into relief through clear feedback loops.

### Emotional Journey Mapping
1.  **Initiation:** *Empowered*. "I can do this myself."
2.  **Configuration:** *Intentional*. "I am making a specific security choice (duration)."
3.  **Creation/Copy:** *Anxiety -> Relief*. The transition from "Oh wait" to "Got it!" via the "Copied" checkmark.
4.  **List View:** *Calm*. "Everything is under control. I see what's what."

### Micro-Emotions
*   **Trust:** Reinforced by the polish of the UI and the rigorous copy interaction.
*   **Clarity:** Reinforced by labeling, removing the "What was this token for again?" confusion.
*   **Safety:** Reinforced by the deliberate "Revoke" confirmation step.

### Design Implications
*   **Confidence:** → Use strong, distinct visual styles for the token value (e.g., monospace font, high contrast) so it feels "real" and important.
*   **Relief:** → The "Copy" button isn't just a utility; it's a confirmation point. Use animation (icon change, toast) to signal success.
*   **Calm:** → Use ample whitespace in the list view. Don't clutter it. Use clear, human-readable dates for expiration.

### Emotional Design Principles
1.  **Anxiety to Relief:** Every high-stakes interaction (One-time view) must have a clear resolution (Successful Copy indication).
2.  **No Ambiguity:** Never leave the user guessing about a token's status (Is it revoked? Is it expiring?) or identity (Labels).

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis
*   **GitHub (Developer Security Gold Standard):** Excels in clear scope selection, specific expiration deadlines (7-90 days), and strictly identifying tokens via prefixes (`ghp_`).
*   **AWS IAM (The "Last Used" Pattern):** Demonstrates the critical importance of valid "Last Accessed" timestamps for confident revocation decisions.
*   **Stripe (Integration Speed):** Sets the bar for "Copy to Clipboard" feedback loops and clearly labeled test/live keys.

### Transferable UX Patterns
*   **Prefixing:** Adopting the `flgrn_octi_tkn_` prefix (similar to GitHub) allows users (and scanners/regex) to instantly identify what the string is.
*   **"Last Used" Metadata:** Adopting the AWS pattern of showing exactly when a credential was last used is essential for the "Revocation Decision" critical moment.
*   **Visual Copy Feedback:** Adopting the Stripe-style "Copied!" toast/transformation provides the necessary emotional "Relief."

### Anti-Patterns to Avoid
*   **The "Masked" Token (`*****a1b2`):** We strictly avoid any interface that suggests the server can "Show" the token again. This maintains the "Zero-Knowledge" mental model.
*   **Silent Expiration:** We avoid letting tokens expire without visual indicators in the list view (e.g., yellow/red icons relative to today's date).
*   **Complexity Overload:** We avoid the AWS IAM complexity of massive policy documents in the initial creation flow. Keep it to Duration + Description.

### Design Inspiration Strategy
*   **Adopt:** GitHub's strict "One-Time View" modal logic.
*   **Adopt:** Stripe's smooth "Copy" interaction design.
*   **Adapt:** AWS's "Last Used" column, simplified for a cleaner table view appropriate for OpenCTI analysts.

## Design System Foundation

### 1.1 Design System Choice
**Established Platform System (MUI V5)**. We will strictly adhere to the existing OpenCTI implementation of Material UI V5.

### Rationale for Selection
*   **Consistency:** The Token Management feature must feel native to the "Profile" and "Settings" areas where it resides. Users should not perceive a context switch.
*   **Maintainability:** Leveraging the platform's core dependency (`@mui/material`) prevents tech debt and ensures instant compatibility with future platform upgrades (e.g., Dark Mode tweaks).
*   **Accessibility:** Existing components already pass platform a11y standards.

### Implementation Approach
*   **Strict Reuse:** **NO NEW COMPONENTS.** We will compose the UI entirely from existing atomic components (`<Dialog>`, `<Button>`, `<TextField>`, `<Select>`, `<List>`, `<ListItem>`, `<Chip>`, `<Tooltip>`).
*   **Theme Inheritance:** All colors, spacing, and typography must be derived directly from the active `theme` provider. Hardcoded hex values or pixel spacings are forbidden.

### Customization Strategy
*   **Composition Only:** "Customization" is limited to the arrangement of existing components (e.g., placing a `CopyIcon` inside a `InputAdornment` within a `TextField`).
*   **Iconography:** Use standard `MuiIcons` exclusively.
*   **Typography:** Use the standard `Typography` component variants (`h2`, `body1`, `caption`) without overriding font families.

## Defining Interaction: The Secure Copy

### Defining Experience
The defining moment of this feature is **"The Secure Copy."** It is the singular point of value transfer where the user obtains the credential. If this interaction is fumble-free and reassuring, the feature succeeds. If it is ambiguous, security theater fails.

### User Mental Model
*   **"The Self-Destructing Message":** Users approach this with the mental model that the token is ephemeral. They understand "Once I close this, it is gone forever."
*   **Expectation:** They expect the system to help them bridge the gap between "Seen" and "Saved."

### Success Criteria
*   **Zero Doubt:** The user must never question "Did that copy work?"
*   **Efficiency:** The action should take less than 2 seconds.
*   **Safety:** The user should not accidentally close the modal before copying (mitigated by layout, not forced locking).

### Novelty Analysis
*   **Pattern:** **Established**. We are adopting the industry-standard "Secret Key Reveal" pattern (GitHub, Stripe, AWS).
*   **Reasoning:** Security flows are not the place for novelty. Familiarity breeds confidence.

### Experience Mechanics
1.  **Initiation:** User clicks "Generate" (after form completion).
2.  **The Reveal:** Modal text options shift. The Token Field appears, pre-selected or focused.
3.  **Interaction:** User clicks the **Copy Icon/Button**.
4.  **Feedback (Critical):**
    *   The Copy Icon instantly transforms into a **Success Checkmark**.
    *   A **"Copied!" tooltip/toast** appears immediately.
    *   *Decision:* The "Close" button remains active (Standard/Low Friction); we trust the user's intent once feedback is delivered.
5.  **Completion:** User manually clicks "Close."

## Visual Design Foundation

### Color System
*   **Strategy:** Strict adherence to existing `theme.palette`.
*   **Semantic Mappings:**
    *   **Success:** `success.main` (Green) for the "Copied!" toast/icon.
    *   **Warning:** `warning.main` (Orange) for expiration alerts (< 7 days).
    *   **Revocation:** `error.main` (Red) for the revoke button/status.
    *   **Neutral:** `text.primary` for the token string itself to ensure maximum contrast.

### Typography System
*   **Strategy:** Use existing `Typography` implementation.
*   **Token Display:** Use the `code` variant or `fira code` font stack *only if already available via standard components/theme*. If not, default to standard `body1` to avoid introducing new assets.
*   **Labels/Values:** Standard `body2` for table rows to match the existing density of admin views.

### Spacing & Layout Foundation
*   **Density:** Use `size="small"` prop on Tables and FormControls to match the `dense` layout preferred by OpenCTI power users.
*   **Modal Layout:** Standard 2-column grid for the Create form (Duration | Description), transitioning to a single full-width centered display for the Token Reveal.

### Accessibility Considerations
*   **Focus Management:** Ensure focus moves immediately to the Token Value (or copy button) when the Reveal modal state activates.
*   **Screen Readers:** The "Copied!" notification must be an `aria-live` region to announce success to non-visual users.

## Design Direction Decision

### Design Directions Explored
We evaluated three approaches:
1.  **The Compact Admin:** High-density table + Drawer creation.
2.  **The Guided Experience:** Standard table + Modal creation.
3.  **The Card Catalog:** Grid view (Discarded due to poor scan-ability).

### Chosen Direction
**Direction 1: "The Compact Admin"**

### Design Rationale
*   **Platform Consistency:** Using a slide-over **Drawer** for creation aligns with OpenCTI's standard pattern for entity creation (e.g., creating Reports, Indicators).
*   **Efficiency:** The Drawer allows users to reference the existing list while configuring the new token (e.g., checking naming conventions).
*   **Density:** A dense data table allows admins to manage users with many tokens without excessive pagination.

### Implementation Approach
*   **Creation Container:** `Drawer` (anchor="right") containing the form.
*   **List Container:** `TableContainer` with dense padding.
*   **Token Reveal:** A dedicated "Success State" within the Drawer after submission, replacing the form content with the One-Time View.

## User Journey Flows

### Journey 1: Token Creation (The Happy Path)
This flow optimizes for the "Secure Copy" moment. The drawer context keeps the user oriented (they can still see their list) while the focus shifts entirely to the new secret.

```mermaid
graph TD
    A[User clicks 'Create Token'] --> B[Drawer Opens (Right)]
    B --> C{Form Input}
    C -->|Duration + Name| D[Submit]
    D --> E[Server Validates & Generates]
    E --> F[Drawer Content Swaps to 'One-Time View']
    F --> G[User clicks Copy]
    G --> H[System shows 'Copied!' Toast]
    H --> I[User closes Drawer]
    I --> J[Table Refreshes with New Token]
```

### Journey 2: Revocation (The Safety Path)
This flow optimizes for error prevention. The friction introduced is intentional (the Confirmation Dialog) to prevent operational outages.

```mermaid
graph TD
    A[User clicks 'Trash' Icon] --> B[Confirmation Dialog Opens]
    B --> C{Decision}
    C -->|Cancel| D[Dialog Closes (No Action)]
    C -->|Confirm| E[Send Revoke Request]
    E --> F[Server Invalidates Token]
    F --> G[Dialog Closes]
    G --> H[Token removed from List]
    H --> I[Audit Log Created]
```

### Journey Patterns
*   **Context Retention:** We use Drawers and Dialogs to keep the parent context (the List) visible in the background, reinforcing where the user is.
*   **Immediate Feedback:** Every destructive or creation action has an immediate visual counterpart (Toast or List Update).

### Flow Optimization Principles
*   **Minimize Navigation:** The user never leaves the "Profile" page. All actions happen in-place.
*   **Cognitive Clarity:** The naming of actions is unambiguous ("Create", "Revoke", "Copy").

## Component Strategy

### Design System Components (Strict Reuse)
*   **Creation:** `<Drawer anchor="right" variant="temporary" />`
*   **List:** `<Table size="small" />`
*   **Dialogs:** `<Dialog maxWidth="xs" />` (for Revoke Confirmation)
*   **Feedback:** `<Alert severity="success" />` (for "Copied!" inline feedback if needed, primarily relying on ItemCopy's toast)

### Custom Components (Composites)
*   **The Token Reveal (Composite):**
    *   **Logic:** A stateful view that displays the token immediately after generation.
    *   **Key Atom:** `<ItemCopy variant="inLine" />`
    *   **Styling:**
        *   Background: `theme.palette.background.accent` (Verified existing token)
        *   Font: `Consolas, monaco, monospace` (Provided by ItemCopy)
        *   Wrapper: `<Box p={3} textAlign="center">` to frame the importance.

### Component Implementation Strategy
*   **"No New Styles":** We will rely 100% on the `ItemCopy` component for the critical "Secure Copy" interaction, ensuring it matches every other copyable ID in the platform.
*   **Drawer Management:** We will use a local state controller or a standard `Drawer` wrapper pattern common in other entities (e.g., `EntityCreation`).

### Implementation Roadmap
1.  **Phase 1 (Critical Path):** The `TokenList` table + `TokenCreation` composite (Drawer + Form + ItemCopy Reveal).
4.  **Phase 2 (Safety):** The `TokenRevocation` dialog logic.

## UX Consistency Patterns

### Feedback Patterns
*   **Errors:** Use the standard Global Messaging Bus (`UserNotifier`). Errors (e.g., API failure) appear as standard Snackbars at the bottom of the screen.
*   **Success:**
    *   **Token Copy:** Inline Tooltip/Toast ("Copied!") triggered by `ItemCopy`.
    *   **Token Deletion:** Global Snackbar ("Token revoked successfully").

### Empty & Loading States
*   **Empty State:** Simple text-based display within the Table body: *"No tokens found. Click + to generate one."* This maintains the dense admin aesthetic.
*   **Loading State:** Use the standard OpenCTI `Loader` component (Spinner) centered in the TableContainer during fetching.

### Dialog & Form Patterns
*   **Destructive Actions:** Always require a secondary confirmation step using a `Dialog` with `TransitionComponent` (Slide up) and explicit "Delete" button styling (Red).
*   **Form Validation:** Validation errors (e.g., missing name) appear inline on the TextField (`error={true}` `helperText="Name is required"`).

### Navigation Patterns
*   **Drawer Behavior:**
    *   **Open:** Slides in from Right.
    *   **Close (Standard):** Clicking outside (Backdrop) or "Cancel" button closes it.
    *   **Close (Token Reveal):** **Prevent** backdrop click closing during the "One-Time View" phase to avoid accidental loss. User must explicitly click "Close".

## Responsive Design & Accessibility

### Responsive Strategy
**Desktop-First / Admin-Centric.**
*   **Optimization Target:** 1024px+ viewports (Typical Analyst workstation).
*   **Mobile/Tablet:** We rely on standard component degradation (horizontal scroll for tables, full-width drawers) but do **not** invest in bespoke mobile layouts for Token Creation, as this is a high-security administrative task rarely performed on mobile.

### Accessibility Strategy (High Importance)
We strictly adhere to **WCAG 2.1 AA** standards, treating keyboard users and screen readers as first-class citizens.

*   **Keyboard Navigation:**
    *   The `Drawer` must trap focus when open.
    *   Focus must programmatically shift to the **Copy Button** (or the Container) immediately upon Token Reveal to ensure keyboard-only users don't miss the event.
*   **ARIA Labels:**
    *   Copy Button: `aria-label="Copy token to clipboard"`
    *   Delete Button: `aria-label="Revoke token {TokenName}"`
    *   Token List: `aria-label="Active API Tokens"`
*   **Visual Contrast:** All text elements (especially the Token Value) must meet 4.5:1 contrast ratios (guaranteed by using `text.primary`).












