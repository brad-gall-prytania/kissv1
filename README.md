# kissv1 — Keep It Super Simple

A teaching project: single-page contacts CRUD app built with Next.js, Azure SQL, and Microsoft Entra ID.

## Stack

| Layer     | Technology                                |
| --------- | ----------------------------------------- |
| Frontend  | Next.js 16 (App Router), TypeScript       |
| Styling   | Tailwind CSS 4                            |
| Database  | Azure SQL (`mssql` package)               |
| Auth      | Auth.js v5 + Microsoft Entra ID           |
| Hosting   | Azure Web App (Linux, Node 20)            |
| CI/CD     | GitHub Actions                            |

## Prerequisites

- Node.js 20+
- npm 9+
- Azure subscription
- Microsoft Entra ID tenant

## Quick Start

```bash
# Clone
git clone https://github.com/brad-gall-prytania/kissv1.git
cd kissv1

# Install
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Azure SQL and Entra ID values

# Create database table
npm run db:migrate

# Seed sample data (10 contacts)
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page to sign in with Microsoft.

## Azure Setup

See [docs/azure-setup.md](docs/azure-setup.md) for step-by-step instructions to provision:

1. Azure SQL Database
2. Microsoft Entra ID App Registration
3. Azure Web App

## npm Scripts

| Script        | Description                          |
| ------------- | ------------------------------------ |
| `dev`         | Start dev server (Turbopack)         |
| `build`       | Production build (standalone output) |
| `start`       | Start production server              |
| `lint`        | Run ESLint                           |
| `db:migrate`  | Create `contacts_tbl` in Azure SQL   |
| `db:seed`     | Insert 10 sample contacts            |
| `db:reset`    | Run migrate + seed                   |

## API Endpoints

| Method   | Endpoint              | Description        |
| -------- | --------------------- | ------------------ |
| `GET`    | `/api/contacts`       | List all contacts  |
| `POST`   | `/api/contacts`       | Create a contact   |
| `GET`    | `/api/contacts/[id]`  | Get one contact    |
| `PUT`    | `/api/contacts/[id]`  | Update a contact   |
| `DELETE` | `/api/contacts/[id]`  | Delete a contact   |

All endpoints require authentication.

## Project Structure

```
kissv1/
├── auth.ts                          # NextAuth v5 config
├── middleware.ts                     # Route protection
├── scripts/
│   ├── migrate.ts                   # CREATE TABLE
│   └── seed.ts                      # Sample data
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Contacts page
│   │   ├── login/page.tsx           # Sign-in page
│   │   └── api/
│   │       ├── auth/[...nextauth]/  # Auth handlers
│   │       └── contacts/            # CRUD API routes
│   ├── components/
│   │   ├── ContactsTable.tsx        # Main data table
│   │   ├── ContactForm.tsx          # Add/edit modal
│   │   ├── DeleteDialog.tsx         # Confirm delete
│   │   ├── Navbar.tsx               # Top bar
│   │   └── ui/                      # Reusable primitives
│   └── lib/
│       ├── db.ts                    # SQL connection pool
│       ├── contacts.ts              # CRUD queries
│       └── types.ts                 # TypeScript interfaces
└── docs/
    └── azure-setup.md               # Azure provisioning guide
```
