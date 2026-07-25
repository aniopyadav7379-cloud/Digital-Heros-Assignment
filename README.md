# LeadDesk Mini

A lead-capture SaaS: a public landing page with a lead form, a REST API backed by PostgreSQL, and an authenticated admin dashboard for managing incoming leads.

## Tech stack

- **Framework:** Next.js 14 (App Router), TypeScript (strict mode)
- **UI:** TailwindCSS, Radix primitives (shadcn-style components), React Hook Form, Zod, TanStack Query
- **API:** Next.js Route Handlers
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Custom email/password auth — bcrypt password hashing + stateless JWT sessions (httpOnly cookie)
- **Testing:** Vitest

## Folder structure

```
src/
  app/
    api/
      auth/           # login, logout, me
      leads/           # POST (public), GET (protected), /:id/status (protected), /export (admin-only)
      health/
    admin/             # admin dashboard (protected by middleware)
    login/             # login page
    layout.tsx         # root layout, providers, fonts
  components/
    ui/                # shadcn-style primitives (Button, Input, Dialog, Toast, ...)
    landing/           # public landing page sections
    admin/             # dashboard-only components
    auth/              # LoginForm
  features/
    leads/             # lead Zod schemas
    auth/               # auth Zod schema + hooks (useLogin, useLogout, useCurrentUser)
  lib/
    auth/              # password hashing, JWT, session cookie, RBAC guards
    prisma.ts, cors.ts, rate-limit.ts, sanitize.ts, api-response.ts, utils.ts
  services/
    leadService.ts     # all Lead business logic / Prisma queries
  types/
  middleware.ts         # edge auth guard + CORS
prisma/
  schema.prisma
  migrations/
  seed.ts
tests/
  unit/
  integration/
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_SECRET` | yes | Random string, 32+ chars, used to sign session JWTs. Generate with `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | no | Session lifetime (default `8h`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | for seeding | Initial admin account created by `npm run prisma:seed` |
| `CORS_ALLOWED_ORIGINS` | no | Comma-separated origins allowed to call the API cross-origin with credentials |
| `LEAD_SUBMIT_RATE_LIMIT` | no | Max lead submissions per IP per minute (default `10`) |
| `LOGIN_RATE_LIMIT` | no | Max login attempts per IP per minute (default `5`) |

### 3. Database setup

Start a local Postgres instance (or point `DATABASE_URL` at one you already have), then:

```bash
npm run prisma:migrate:deploy   # apply migrations
npm run prisma:seed             # create the initial admin user (requires SEED_ADMIN_PASSWORD)
```

For iterating on the schema locally, use `npm run prisma:migrate` (creates new migration files) instead of `migrate:deploy`.

### 4. Run locally

```bash
npm run dev
```

- Landing page: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin` (redirects to `/login` if not authenticated)
- Login: `http://localhost:3000/login`

### 5. Build

```bash
npm run build
npm run start
```

### Docker

```bash
cp .env.example .env   # set JWT_SECRET and SEED_ADMIN_PASSWORD here first
docker compose up --build
```

This starts Postgres, runs migrations + seeding once, then starts the app on `http://localhost:3000`.

## Authentication

- **Password hashing:** bcrypt, work factor 12 (`src/lib/auth/password.ts`).
- **Sessions:** stateless JWT (HS256, via `jose`) stored in an `httpOnly`, `SameSite=Lax` cookie (`leaddesk_session`). No server-side session store required. Tokens expire after `JWT_EXPIRES_IN` (default 8h).
- **Login:** `POST /api/auth/login` verifies credentials against the `users` table and sets the session cookie. Failed attempts are rate-limited per IP, and the failure path takes the same time whether the account exists or not, so responses can't be used to enumerate valid emails.
- **Logout:** `POST /api/auth/logout` clears the cookie.
- **Current user:** `GET /api/auth/me` returns the session's user or `401`.
- **Route protection:** `src/middleware.ts` runs at the edge and (a) redirects unauthenticated visitors away from `/admin/*` to `/login`, and (b) rejects unauthenticated/unauthorized requests to sensitive `/api/leads` methods before they reach the route handler. Each protected route handler *also* independently calls `requireAuth`/`requireRole` (`src/lib/auth/rbac.ts`) — this defense-in-depth means a bug in either layer alone doesn't fully bypass protection.
- **Roles:** `ADMIN` and `STAFF`. Both can view leads and update status; only `ADMIN` can export CSV data.

## Database schema

### `leads`

| Column | Type | Notes |
|---|---|---|
| `id` | text (cuid) | PK |
| `name` | varchar(120) | |
| `email` | varchar(254) | indexed |
| `budget` | enum `BudgetRange` | `UNDER_1K`, `ONE_TO_5K`, `FIVE_TO_20K`, `TWENTY_TO_50K`, `OVER_50K` |
| `message` | varchar(2000) | |
| `status` | enum `LeadStatus` | `NEW` → `CONTACTED` → `CLOSED`, indexed |
| `createdAt` / `updatedAt` | timestamp | |

### `users` (added in the auth migration, additive only — leaves `leads` untouched)

| Column | Type | Notes |
|---|---|---|
| `id` | text (cuid) | PK |
| `name` | varchar(120) | |
| `email` | varchar(254) | unique, indexed |
| `passwordHash` | varchar(255) | bcrypt hash, never returned by any API response |
| `role` | enum `Role` | `ADMIN`, `STAFF` |
| `createdAt` / `updatedAt` | timestamp | |

Migrations live in `prisma/migrations/`: `20240115000000_init` (leads) and `20240220000000_add_users_auth` (users — additive only).

## API documentation

All responses share an envelope: `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code", "message", "details?" } }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | public | `{ email, password }` → sets session cookie, returns the user. `401` on bad credentials, `429` if rate-limited. |
| `POST` | `/api/auth/logout` | any | Clears the session cookie. |
| `GET` | `/api/auth/me` | session | Returns the current user, or `401`. |
| `POST` | `/api/leads` | public | Creates a lead. Validates body with Zod; `422` on validation failure, `400` on malformed JSON, `429` if rate-limited. Duplicate active leads (same email, not yet `CLOSED`) return the existing lead instead of creating a new row. |
| `GET` | `/api/leads` | `ADMIN`, `STAFF` | Lists leads. Query params: `search`, `status` (`NEW`\|`CONTACTED`\|`CLOSED`\|`ALL`), `page`, `pageSize`. `401`/`403` if not authorized. |
| `PATCH` | `/api/leads/:id/status` | `ADMIN`, `STAFF` | `{ status }` → updates a lead's status. `404` if the lead doesn't exist, `422` on an invalid status value. |
| `GET` | `/api/leads/export` | `ADMIN` only | Streams a CSV of leads matching `search`/`status`. |
| `GET` | `/api/health` | public | `{ status, database, timestamp }`; `503` if the database is unreachable. |

## Security

- **Validation:** every write endpoint validates its body with the same Zod schema on client and server (`createLeadSchema`, `loginSchema`, `updateLeadStatusSchema`) — nothing malformed reaches the database.
- **Sanitization:** free-text fields (`name`, `message`) are stripped of HTML tags and control characters server-side (`src/lib/sanitize.ts`) as defense in depth against stored XSS, in addition to React's default output escaping.
- **SQL injection:** all queries go through Prisma's parameterized query builder — no raw string concatenation into SQL anywhere in the app.
- **Rate limiting:** per-IP limits on `POST /api/leads` and `POST /api/auth/login`.
- **CORS:** disabled by default (same-origin only); cross-origin callers must be explicitly allow-listed via `CORS_ALLOWED_ORIGINS`.
- **Headers:** CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and HSTS in production (`next.config.js`).
- **Error handling:** a single `handleRouteError` maps Zod errors → `422`, domain `ApiError`s → their declared status, and anything unexpected → a generic `500` (internals are logged server-side, never leaked to the client).

## Testing

```bash
npm run test         # run once
npm run test:watch   # watch mode
```

Covers:
- **Unit:** password hashing (bcrypt), JWT sign/verify (including tampered/expired/wrong-secret rejection), Zod schema validation.
- **Integration:** `POST /api/auth/login` (bad body, wrong password, unknown user, success + cookie issuance), protected `/api/leads` and `/api/leads/export` routes (401 without a session, 403 for insufficient role, 200 for an authorized session), and the edge `middleware` (redirects, pass-through, CORS preflight).

Tests run against mocked Prisma calls where a database isn't the thing under test, and against a real Postgres instance (via `prisma migrate deploy`) in CI for the full build.
