# kissv1 Build Log & Troubleshooting Reference

**Date:** March 13, 2026
**Project:** kissv1 — Keep It Super Simple (Next.js + Azure SQL + Entra ID)

---

## What We Built

A single-page contacts CRUD app as a teaching project to learn:
- Next.js App Router with TypeScript and Tailwind CSS
- Azure SQL database connectivity via the `mssql` npm package
- Microsoft Entra ID authentication via Auth.js v5
- Azure Web App deployment via GitHub Actions CI/CD

### Tech Stack

| Layer     | Technology                                |
| --------- | ----------------------------------------- |
| Frontend  | Next.js 16 (App Router), TypeScript       |
| Styling   | Tailwind CSS 4                            |
| Database  | Azure SQL (`mssql` package)               |
| Auth      | Auth.js v5 + Microsoft Entra ID           |
| Hosting   | Azure Web App (Linux, Node 20)            |
| CI/CD     | GitHub Actions → Azure Web App            |

### Features
- Microsoft Entra ID login (single-tenant)
- Contacts table with 12 fields (name, email, phone, company, job title, address, city, state, zip, notes)
- Full CRUD: Add, Edit, Delete contacts via modal forms
- Server-side rendering with client-side state management
- All API routes auth-gated
- Parameterized SQL queries to prevent injection
- 10 seed contacts for testing

---

## Build Steps (What We Did)

### 1. Repository & Scaffold
- Installed GitHub CLI (`gh`) via `winget install GitHub.cli`
- Authenticated with `gh auth login`
- Created repo: `gh repo create brad-gall-prytania/kissv1 --public`
- Scaffolded Next.js: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --turbopack --yes`
- Installed deps: `npm install mssql next-auth@beta @auth/core` and `npm install -D @types/mssql tsx dotenv`

### 2. Project Configuration
- Set `output: "standalone"` in `next.config.ts` (required for Azure Web App deployment)
- Created `.env.example` with all required environment variables
- Updated `.gitignore` to only ignore `.env.local` and `.env.*.local` (not `.env.example`)
- Added npm scripts: `db:migrate`, `db:seed`, `db:reset`

### 3. Database Layer
- `src/lib/db.ts` — Connection pool singleton with `encrypt: true` for Azure SQL
- `src/lib/types.ts` — Contact interface and ContactInput type
- `src/lib/contacts.ts` — Five CRUD functions using parameterized queries with `OUTPUT INSERTED.*`
- `scripts/migrate.ts` — Creates `contacts_tbl` with IF NOT EXISTS check
- `scripts/seed.ts` — Inserts 10 sample contacts

### 4. Authentication
- `src/auth.ts` — NextAuth v5 config with MicrosoftEntraID provider (initially created at project root as `auth.ts`, had to move to `src/auth.ts` to match the `@/*` alias)
- `middleware.ts` — Route protection excluding `/login`, `/api/auth`, and static assets
- `src/app/login/page.tsx` — Sign-in page with server action
- `src/components/Navbar.tsx` — Displays user email and sign-out button
- `src/components/Providers.tsx` — SessionProvider wrapper for client components

### 5. API Routes
- `src/app/api/contacts/route.ts` — GET (list all) + POST (create)
- `src/app/api/contacts/[id]/route.ts` — GET (one) + PUT (update) + DELETE
- All routes check `auth()` session before proceeding

### 6. Frontend Components
- UI primitives: `Button.tsx`, `Input.tsx` (with Textarea), `Modal.tsx`, `Spinner.tsx`
- `ContactsTable.tsx` — Main client component with table, CRUD state, and fetch calls
- `ContactForm.tsx` — Two-column modal form for add/edit
- `DeleteDialog.tsx` — Confirmation modal
- `src/app/page.tsx` — Server component that fetches initial contacts
- `src/app/layout.tsx` — Root layout with Providers and Navbar

### 7. Azure Provisioning
- Created Azure SQL Database (Basic tier) in resource group `rg-kissv1` on server `prytania-sql-ai`
- Created Entra ID app registration `kissv1-app` (single tenant)
- Created Azure Web App `kissv1` (Linux, Node 20, Central US)
- Ran `npm run db:migrate` and `npm run db:seed` successfully from local

### 8. CI/CD Setup
- Created `.github/workflows/deploy.yml` with GitHub Actions
- Used OIDC federation (no stored passwords) via `azure/login@v2`
- Added federated credential in Entra ID app registration for GitHub Actions
- Added GitHub repo secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
- Assigned **Contributor** role to the app registration on the Azure subscription

---

## Troubleshooting Log

### Issue 1: `@/auth` module not found during build
**Symptom:** `npm run build` failed with "Module not found: Can't resolve '@/auth'" on 7 files.
**Root Cause:** `auth.ts` was at the project root, but the `@/*` alias in `tsconfig.json` maps to `./src/*`. So `@/auth` resolved to `./src/auth` which didn't exist.
**Fix:** Moved `auth.ts` from project root to `src/auth.ts`.

### Issue 2: GitHub Actions — Azure login failed "No subscriptions found"
**Symptom:** Workflow failed at `azure/login@v2` step with "No subscriptions found for ***".
**Root Cause:** The Entra ID app registration (`kissv1-app`) didn't have permission to access the Azure subscription.
**Fix:** Assigned the **Contributor** role to `kissv1-app` on the subscription:
- Azure Portal → Subscriptions → Access control (IAM) → Add role assignment
- Role: **Contributor** (the general built-in role under "Privileged administrator roles", NOT the similarly-named specific ones like "Classic Storage Account Contributor")
- Assign to: `kissv1-app` service principal

### Issue 3: Azure Web App — "Application Error" (503)
**Symptom:** App deployed successfully via GitHub Actions but returned 503 with "Application Error" page.
**Root Cause:** Multiple issues:
1. Azure's Oryx build system was interfering with the standalone deployment (extracting `node_modules.tar.gz` and rearranging files)
2. The startup command path was wrong

**Fixes applied:**
- Added `SCM_DO_BUILD_DURING_DEPLOYMENT=false` as an Azure environment variable to disable Oryx build
- Added `HOSTNAME=0.0.0.0` as an Azure environment variable

### Issue 4: Azure Web App — "Cannot find module server.js"
**Symptom:** Logs showed `Error: Cannot find module '/home/site/wwwroot/.next/standalone/server.js'`
**Root Cause:** The deploy workflow zips from INSIDE `.next/standalone/`, so `server.js` is at the zip root. When extracted to `/home/site/wwwroot/`, it's at `/home/site/wwwroot/server.js`. But the startup command was set to `node .next/standalone/server.js` — the wrong path.
**Why the manual fix didn't work:** Changing the startup command in Azure Portal's General Settings to `node server.js` didn't persist correctly — Azure kept using the old path.
**Fix:** Updated the GitHub Actions workflow to inject a `package.json` with a `start` script into the standalone output:
```yaml
echo '{"name":"kissv1","scripts":{"start":"node server.js"}}' > .next/standalone/package.json
```
This way Azure auto-detects `npm start` → `node server.js` without relying on a manual startup command setting. Also cleared the startup command field in Azure Portal General Settings.

### Issue 5: Entra ID — Redirect URI mismatch
**Symptom:** After clicking "Sign in with Microsoft", got error `AADSTS50011: The redirect URI ... does not match the redirect URIs configured`.
**Root Cause:** The Entra ID app registration only had the localhost redirect URI, not the production one.
**Fix:** Added the production redirect URI in Azure Portal:
- App registrations → `kissv1-app` → Authentication → Add URI:
  `https://kissv1-hkb7ffd7gfbqajek.centralus-01.azurewebsites.net/api/auth/callback/microsoft-entra-id`

---

## Azure Environment Variables (Production)

These must be set in Azure App Services → kissv1 → Environment variables:

| Variable | Purpose |
| -------- | ------- |
| `AZURE_SQL_SERVER` | SQL Server hostname |
| `AZURE_SQL_DATABASE` | Database name |
| `AZURE_SQL_USER` | SQL admin username |
| `AZURE_SQL_PASSWORD` | SQL admin password |
| `AZURE_SQL_PORT` | 1433 |
| `AUTH_SECRET` | Auth.js encryption key (generate with `npx auth secret`) |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | Entra ID Application (client) ID |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Entra ID client secret value |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | `https://login.microsoftonline.com/<TENANT_ID>/v2.0` |
| `AUTH_URL` | Production URL (must be https, not localhost) |
| `NEXTAUTH_URL` | Same as AUTH_URL |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` — disables Oryx build |
| `HOSTNAME` | `0.0.0.0` — binds to all interfaces |

---

## Key Lessons Learned

1. **`@/*` alias maps to `src/*`** — Files outside `src/` can't be imported with `@/`. Auth config must live inside `src/` when using the `--src-dir` flag.

2. **Azure Oryx build interferes with standalone deploys** — Always set `SCM_DO_BUILD_DURING_DEPLOYMENT=false` when deploying pre-built Next.js standalone packages.

3. **Startup command in Azure Portal can be unreliable** — Instead of depending on the Portal setting, inject a `package.json` with a `start` script into the deployment package. Azure auto-detects `npm start`.

4. **Standalone zip structure matters** — When zipping from inside `.next/standalone/`, `server.js` is at the root of the zip, NOT at `.next/standalone/server.js`. The startup command must match.

5. **Entra ID needs TWO redirect URIs** — One for localhost development (`http://localhost:3000/api/auth/callback/microsoft-entra-id`) and one for production (`https://<app>.azurewebsites.net/api/auth/callback/microsoft-entra-id`).

6. **Contributor role is required for GitHub Actions OIDC** — The Entra ID app registration needs Contributor access on the Azure subscription for GitHub Actions to deploy via OIDC federation.

7. **`AUTH_URL` and `NEXTAUTH_URL` must be the production URL** — Not localhost. These control where Auth.js redirects after login.
