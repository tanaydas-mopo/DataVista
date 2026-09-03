# DataVista — Vite/Node.js to Next.js Migration Prompt

You are a senior Next.js migration engineer responsible for migrating an existing production application named **DataVista** from its current **Node.js + Vite architecture to Next.js**.

## Primary Objective

Migrate the existing DataVista application to **Next.js while preserving the existing application exactly as it currently behaves and appears**.

This is a **migration**, not a redesign, feature rewrite, or product enhancement.

The final Next.js application must preserve:

- Existing UI
- Existing UX
- Existing layouts
- Existing pages
- Existing components
- Existing functionality
- Existing business logic
- Existing application data
- Existing mock/seed data
- Existing API interactions
- Existing forms
- Existing validation
- Existing navigation
- Existing authentication behavior
- Existing authorization behavior
- Existing loading states
- Existing error states
- Existing empty states
- Existing animations
- Existing icons
- Existing images
- Existing typography
- Existing spacing
- Existing colors
- Existing responsive behavior
- Existing mobile/tablet/desktop behavior
- Existing user flows

The migration must change the **underlying framework/application architecture**, not the product itself.

---

# 1. Non-Negotiable Migration Rules

## Rule 1 — Do NOT redesign the application

Do not change the visual design unless a change is absolutely required by Next.js compatibility.

Do NOT:

- redesign layouts
- modernize the UI
- change colors
- change typography
- replace components merely because a different implementation is preferred
- change spacing
- change button styles
- change cards
- change navigation
- change page structure
- replace icons
- replace images
- introduce new animations
- remove existing animations
- introduce a new design system
- change responsive breakpoints without necessity

The migrated application should look as close to the existing DataVista application as technically possible.

Treat the current application as the **source of truth**.

---

# 2. Preserve Existing Project Data

All existing project data must remain intact.

Before modifying the application:

1. Inspect the complete repository.
2. Identify all data sources.
3. Identify mock data.
4. Identify seed data.
5. Identify static JSON files.
6. Identify environment variables.
7. Identify database/API integrations.
8. Identify local storage usage.
9. Identify session storage usage.
10. Identify constants/configuration data.
11. Identify uploaded/static assets.

Do not delete or replace existing data simply to make the Next.js migration easier.

If data currently exists in JSON, TypeScript, JavaScript, databases, APIs, mock files, constants, localStorage, sessionStorage, or environment variables, preserve its structure and semantics.

---

# 3. Preserve Existing UI Components

Analyze the existing component tree before beginning migration.

Create an inventory of:

- pages
- layouts
- components
- reusable UI components
- forms
- tables
- charts
- modals
- dialogs
- dropdowns
- tabs
- navigation
- sidebars
- headers
- footers
- cards
- dashboards
- filters
- pagination
- loaders
- error boundaries
- empty states
- notifications
- tooltips

Reuse existing components whenever technically possible.

Do NOT rewrite components unnecessarily.

Where an existing React component can work in Next.js with minimal modification, retain its structure.

---

# 4. Preserve Existing Pages

Identify every existing route.

Create a route mapping such as:

| Current Vite route | Next.js route |
|---|---|
| `/` | `app/page.tsx` |
| `/dashboard` | `app/dashboard/page.tsx` |
| `/users` | `app/users/page.tsx` |
| `/settings` | `app/settings/page.tsx` |
| `/analytics` | `app/analytics/page.tsx` |
| ... | ... |

Every existing route must continue to exist unless there is a clear technical reason not to.

No existing page should disappear.

No existing functionality should be silently removed.

---

# 5. Adopt Next.js App Router

Use the modern **Next.js App Router** architecture unless the existing project has a compelling technical requirement that makes another approach necessary.

Prefer a structure such as:

```text
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── dashboard/
│   └── page.tsx
├── users/
│   └── page.tsx
├── analytics/
│   └── page.tsx
└── ...
```

Use nested layouts where the existing application has shared layouts.

Preserve the existing route hierarchy.

---

# 6. Preserve Client-Side Interactivity

Next.js Server Components must NOT be introduced in a way that breaks existing functionality.

For components requiring:

- `useState`
- `useEffect`
- `useContext`
- browser APIs
- event handlers
- localStorage
- sessionStorage
- client-side libraries
- interactive charts
- drag-and-drop
- browser-only APIs

use:

```tsx
"use client";
```

where required.

Do not blindly convert all components into Server Components.

At the same time, do not blindly make the entire application client-side.

Use the appropriate Next.js architecture while preserving behavior.

---

# 7. Preserve Existing Styling

Inspect the current styling architecture.

Determine whether DataVista uses:

- CSS
- CSS Modules
- Tailwind CSS
- styled-components
- Emotion
- Sass
- custom design tokens
- inline styles
- component libraries

Preserve the existing styling system whenever possible.

Do not migrate styling frameworks unless absolutely necessary.

The goal is **visual parity**, not technological replacement for its own sake.

---

# 8. Preserve Assets

Every existing asset must be preserved.

Inspect:

```text
/public
/src/assets
/images
/icons
/fonts
```

and any other asset directories.

Preserve:

- logos
- icons
- product images
- illustrations
- avatars
- SVGs
- fonts
- background images
- animations
- static files

Do not replace existing assets with newly generated equivalents.

If an asset currently works using a normal `<img>` tag, do not automatically replace it with `next/image` if doing so changes rendering behavior.

Use Next.js image optimization only when it does not alter the UI or behavior.

---

# 9. Preserve Existing Dependencies

Audit:

```text
package.json
package-lock.json
pnpm-lock.yaml
yarn.lock
```

Identify every dependency.

Categorize them as:

1. required
2. optional
3. Vite-specific
4. Node-specific
5. browser-only
6. Next.js-incompatible
7. replaceable

Remove Vite-specific dependencies only when their functionality is replaced by Next.js.

Do not remove dependencies simply because they appear unused without verifying the entire repository.

---

# 10. Replace Vite-Specific Functionality

Identify all Vite-specific code, including:

```text
import.meta.env
VITE_* environment variables
vite.config.*
virtual modules
Vite plugins
Vite aliases
Vite-specific asset imports
Vite dev server configuration
Vite-specific proxy configuration
```

Migrate these to their Next.js equivalents.

For example:

### Existing

```ts
import.meta.env.VITE_API_URL
```

### Next.js

For browser-accessible variables:

```ts
process.env.NEXT_PUBLIC_API_URL
```

For server-only variables:

```ts
process.env.API_SECRET
```

Do not expose server secrets through `NEXT_PUBLIC_*`.

---

# 11. Preserve API Architecture

Before modifying API behavior, determine how DataVista communicates with its backend.

Possible patterns include:

```text
Frontend → external API
Frontend → Node.js backend
Frontend → database
Frontend → REST API
Frontend → GraphQL
Frontend → WebSocket
Frontend → Supabase
Frontend → Firebase
```

Do not automatically move APIs into Next.js.

First understand the existing architecture.

If the current backend is separate and functional, preserve it.

If the Node.js server is only being used to serve the Vite frontend, migrate that responsibility to Next.js.

If the Node.js server contains actual backend/business logic, **do not delete or rewrite it** unless explicitly required.

---

# 12. Authentication Must Remain Identical

Identify the existing authentication architecture.

Preserve:

- login
- signup
- logout
- session persistence
- token handling
- OAuth
- Google authentication
- protected routes
- redirects
- session expiration
- role-based authorization
- permissions
- user state

Do not change authentication providers during this migration.

Do not introduce a different authentication architecture merely because Next.js supports another solution.

---

# 13. Preserve URL Behavior

Existing URLs should remain valid.

Preserve:

- route parameters
- query parameters
- dynamic routes
- nested routes
- redirects
- URL state
- filter parameters
- pagination parameters

Do not break existing bookmarks or deep links.

---

# 14. Preserve Browser Behavior

Check all browser-specific behavior.

Especially inspect:

```text
window
document
navigator
localStorage
sessionStorage
cookies
URL
URLSearchParams
IntersectionObserver
ResizeObserver
WebSocket
File API
Clipboard API
Notification API
```

Any code using browser-only APIs must execute on the client.

Do not introduce SSR/hydration errors.

---

# 15. Prevent Hydration Problems

After migration, specifically test for:

```text
Hydration failed
Text content does not match
Expected server HTML to contain
window is not defined
document is not defined
localStorage is not defined
navigator is not defined
```

Fix these without changing the visible behavior of the application.

Do not hide hydration warnings simply to achieve a successful build.

---

# 16. Preserve Charts and Data Visualization

Because this application is named **DataVista**, carefully preserve all visualization functionality.

Inspect every:

- chart
- graph
- dashboard
- table
- KPI
- metric
- tooltip
- legend
- filter
- data transformation
- aggregation
- sorting
- pagination

Do not modify:

- chart types
- chart dimensions
- colors
- legends
- axis behavior
- tooltip behavior
- data calculations

unless technically required for Next.js compatibility.

---

# 17. Preserve Loading, Error, and Empty States

Every existing state must remain.

For each major component/page verify:

```text
Loading
Success
Empty
Error
Unauthorized
Not Found
Submitting
Updating
Deleting
Refreshing
```

Do not replace existing loaders with generic Next.js loaders.

Do not remove existing error handling.

Do not replace existing empty states with blank screens.

---

# 18. Preserve Forms

Audit every form.

Preserve:

- validation
- validation messages
- field behavior
- disabled states
- submit behavior
- loading states
- success messages
- error messages
- reset behavior
- keyboard behavior

Do not rewrite form libraries unless necessary.

---

# 19. Preserve Responsive Design

Validate the existing application at:

```text
Mobile
Tablet
Laptop
Desktop
Large Desktop
```

Compare the migrated version against the original.

The following must remain visually consistent:

- widths
- heights
- breakpoints
- stacking behavior
- sidebar behavior
- navigation
- grids
- tables
- cards
- typography
- spacing

---

# 20. Preserve SEO and Metadata Where Already Present

Identify existing:

```text
<title>
meta description
Open Graph metadata
favicon
robots
sitemap
canonical URLs
structured data
```

Migrate these to Next.js metadata APIs without changing their existing values unless necessary.

---

# 21. Preserve Environment Configuration

Identify:

```text
.env
.env.local
.env.development
.env.production
```

Create the appropriate Next.js environment configuration.

Do NOT expose secrets.

Do NOT commit secret values.

Use `NEXT_PUBLIC_*` only for values that are intentionally exposed to the browser.

---

# 22. Preserve Project Structure Where Practical

Do not reorganize the entire codebase unnecessarily.

You may introduce the Next.js-required structure:

```text
app/
public/
```

but keep existing reusable code where practical:

```text
components/
lib/
hooks/
services/
utils/
types/
constants/
```

Avoid massive folder restructuring unless required.

---

# 23. Migration Strategy

Perform the migration in the following stages.

## Stage 1 — Repository Audit

Before editing anything, inspect the complete project.

Determine:

```text
Framework
Build system
React version
Node version
Dependencies
Routes
Components
Styling
Assets
Authentication
API architecture
State management
Data sources
Environment variables
Backend architecture
Testing
Deployment
```

Produce a migration map before making changes.

---

## Stage 2 — Establish Next.js

Create the Next.js foundation.

Configure:

```text
Next.js
React
TypeScript
ESLint
existing styling system
existing aliases
environment variables
```

Do not introduce unrelated technologies.

---

## Stage 3 — Migrate Global Application Shell

Migrate:

```text
root layout
fonts
global CSS
providers
theme
authentication context
global state
notifications
navigation
```

Preserve the existing behavior and visuals.

---

## Stage 4 — Migrate Routes

Convert existing Vite routes into Next.js routes.

For every route:

```text
old route
    ↓
Next.js route
```

Verify each route independently.

---

## Stage 5 — Migrate Components

Move reusable components with the smallest possible changes.

Only make code changes required for:

```text
SSR compatibility
Server/Client component boundaries
Next.js routing
environment variables
asset resolution
API integration
```

Do not perform unrelated refactoring.

---

## Stage 6 — Migrate Data/API Logic

Preserve existing data flow.

Verify:

```text
Fetching
Caching
Mutations
Error handling
Authentication headers
Request cancellation
Pagination
Filtering
Sorting
Realtime updates
```

---

## Stage 7 — Remove Vite

Once the application works correctly under Next.js, remove only Vite-specific infrastructure.

Examples:

```text
vite
@vitejs/plugin-react
vite.config.*
Vite-only plugins
VITE_* usage
Vite-only scripts
```

Do not remove anything that the application still depends on.

---

# 24. Validation Requirements

The migration is NOT complete when:

```bash
npm run build
```

succeeds.

The migration is complete only when the application has **functional and visual parity**.

## Functional parity

Verify every:

```text
page
route
button
form
modal
dropdown
filter
search
pagination
authentication action
API action
CRUD action
chart interaction
navigation action
```

---

## Visual parity

Compare the original Vite version against the Next.js version.

Check:

```text
Colors
Spacing
Typography
Component dimensions
Alignment
Icons
Images
Borders
Shadows
Animations
Transitions
Responsive behavior
```

No intentional visual redesign is permitted.

---

## Console validation

The migrated application should not contain avoidable:

```text
errors
hydration errors
React warnings
missing key warnings
404 asset errors
failed API requests
runtime exceptions
```

---

# 25. Performance

Do not sacrifice performance, but performance optimization must not alter the product.

Use Next.js optimizations where safe:

```text
Server Components
dynamic imports
code splitting
image optimization
font optimization
route-level loading
```

However, do NOT aggressively optimize components in a way that changes:

- rendering behavior
- timing-sensitive interactions
- animations
- UI appearance
- existing data flow

---

# 26. Do Not Introduce Scope Creep

Do NOT add:

```text
new features
new pages
new dashboards
new authentication providers
new analytics
new UI components
new design systems
new business logic
```

Do NOT "improve" unrelated code while migrating.

Every change should answer:

> Is this change required to migrate DataVista from the existing Vite/Node architecture to Next.js?

If the answer is no, do not make the change.

---

# 27. Code Quality Requirements

The resulting application must be:

- production-ready
- type-safe
- maintainable
- free of unnecessary duplication
- compatible with the selected Next.js version
- compatible with the existing backend/API
- free from avoidable hydration issues
- free from avoidable client/server boundary mistakes

Do not create temporary migration hacks that remain in production.

---

# 28. Migration Compatibility Matrix

Create a final compatibility matrix:

| Existing DataVista Feature | Existing Implementation | Next.js Implementation | Status |
|---|---|---|---|
| Routing | Vite Router | Next.js App Router | ⬜ |
| Styling | Existing system | Preserved | ⬜ |
| Authentication | Existing provider | Preserved | ⬜ |
| API | Existing API | Preserved | ⬜ |
| Charts | Existing library | Preserved | ⬜ |
| State | Existing state system | Preserved | ⬜ |
| Assets | Existing assets | Preserved | ⬜ |
| Environment | Vite env | Next.js env | ⬜ |
| Static files | Existing public assets | Next.js public | ⬜ |

Expand this table for the actual DataVista repository.

---

# 29. Final Acceptance Criteria

The migration is accepted only when all of the following are true:

### UI

The Next.js version visually matches the original DataVista application.

### Data

All existing application data remains available and unchanged.

### Functionality

All existing user workflows continue to work.

### Routes

All existing routes work.

### Authentication

Authentication and authorization behave exactly as before.

### API

Existing API integrations continue working.

### Responsive Design

Mobile, tablet, and desktop behavior is preserved.

### Assets

Existing assets remain intact and correctly loaded.

### Performance

The application performs at least as well as the original where practical.

### Build

The project successfully builds with Next.js.

### Production

The application can be deployed as a production Next.js application.

---

# 30. Critical Instruction

**Do not treat the current DataVista codebase as something to improve visually. Treat it as the canonical product implementation.**

The only primary objective is:

```text
CURRENT DATAVISTA
        ↓
   SAME PRODUCT
        ↓
DIFFERENT FRAMEWORK
        ↓
       NEXT.JS
```

Expected result:

```text
Before:
DataVista
React + Vite + existing Node.js architecture

After:
DataVista
React + Next.js

UI:                SAME
UX:                SAME
Data:              SAME
Features:          SAME
Routes:            SAME
Business Logic:    SAME
Assets:            SAME
Authentication:    SAME
API behavior:      SAME

Underlying framework/build architecture:
CHANGED TO NEXT.JS
```

Before finishing, explicitly verify that no product-level behavior, data, UI element, or user flow was unintentionally changed during migration.

---

## Important Architectural Constraint

Do **not** blindly interpret "migrate Node.js to Next.js" as "rewrite the backend."

Vite is the frontend build tool, while Node.js may contain actual backend/server/business logic.

First determine what the existing Node.js layer does:

1. If Node.js is only serving the Vite application, migrate that responsibility to Next.js.
2. If Node.js contains backend/API/business logic, preserve that backend unless the migration explicitly requires moving it.
3. If the backend is independent and already working, keep it independent.
4. Only move backend functionality into Next.js when there is a clear technical requirement and the move can be made without changing behavior.

**The migration target is Next.js, while the existing product behavior remains the source of truth.**
