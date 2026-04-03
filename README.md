# Finance Dashboard Backend

A backend for a finance dashboard system where different users interact with financial records based on their role. Built with Node.js, Express, TypeScript, and PostgreSQL.

- **Live API**: https://finance-dashboard-9spq.onrender.com
- **Frontend**: https://financedashboardnew.netlify.app

## Features

### User and Role Management
- Create and manage users with name, email, password, role, and status
- Three roles: **Viewer** (dashboard only), **Analyst** (dashboard + records read), **Admin** (full access)
- Activate or deactivate user accounts
- Admins cannot deactivate their own account

### Financial Records
- Create, view, update, and soft delete financial records
- Each record has amount, type (income/expense), category, date, and an optional note
- Filter by date range, type, category, or search text
- Sort by date, amount, or timestamps
- Pagination on all list endpoints

### Dashboard Summary
- Total income, total expenses, and net balance
- Category-wise breakdown with per-category income, expense, and record count
- Daily, weekly, and monthly trend data
- Recent activity feed

### Access Control
- Role-to-permission mapping enforced via middleware on every protected route
- Inactive users are rejected before any business logic runs
- Viewers cannot access records; analysts cannot create or modify records or users

### Validation and Error Handling
- Request validation with Zod on every endpoint
- Consistent error response envelope with error codes and field-level details
- Appropriate HTTP status codes throughout

### Additional
- JWT authentication with configurable expiry
- Rate limiting: 200 req/15 min globally, 20 req/15 min on auth routes
- Audit log for all create, update, and delete actions
- OpenAPI spec and Postman collection included

## Stack

- Runtime: Node.js `25.8.2`
- Framework: Express `5.1.0`
- Language: TypeScript `6.0.2`
- ORM: Prisma `7.6.0`
- Database: PostgreSQL
- Validation: Zod
- Auth: JWT
- Docs: OpenAPI + Postman collection

## Documentation

- [API Docs (Swagger UI)](https://petstore.swagger.io/?url=https://raw.githubusercontent.com/ajeetchoubey/finance-dashboard/master/docs/openapi.yaml)
- [OpenAPI Spec](docs/openapi.yaml)
- [Postman Collection](docs/postman-collection.json)

## Standout Additions

- Swagger/OpenAPI documentation
- Postman collection for quick testing
- Demo seed data for users, roles, categories, and records
- Soft delete for records
- Pagination and filtering on list endpoints
- Consistent error response format
- Prisma 7 style config with PostgreSQL adapter
- Type-safe TypeScript + ESM scaffold
- Docker Compose for PostgreSQL local setup

## Deployment

- **Backend**: Render (free tier) — https://finance-dashboard-9spq.onrender.com
- **Database**: Neon (free tier, serverless PostgreSQL)
- **Frontend**: Netlify (free tier) — https://financedashboardnew.netlify.app

### Prerequisites

- A [GitHub](https://github.com) account with both repos pushed
- A [Neon](https://neon.tech) account for the database
- A [Render](https://render.com) account for the backend
- A [Netlify](https://netlify.com) account for the frontend

### Step 1 — Database (Neon)

1. Create a free project on Neon and select the region closest to your backend.
2. From the **Connection Details** panel, copy two connection strings:
   - **Pooled** (has `-pooler` in the host) → used as `DATABASE_URL` at runtime
   - **Direct** (no `-pooler`) → used as `DIRECT_URL` for migrations

### Step 2 — Backend (Render)

1. Create a new **Web Service** on Render and connect the backend GitHub repo.
2. Leave **Root Directory** empty. Render auto-detects `render.yaml` with the correct settings:
   - **Build**: `npm ci --include=dev && npm run prisma:generate && npm run build`
   - **Start**: `npm run migrate:deploy && npm start`
3. Set these environment variables in the Render dashboard:

   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Neon pooled connection string |
   | `DIRECT_URL` | Neon direct connection string |
   | `JWT_SECRET` | Use the **Generate** button in Render |
   | `JWT_EXPIRES_IN` | `1d` |
   | `CORS_ORIGIN` | Your Netlify frontend URL |

4. Deploy. Prisma migrations run automatically on every start before traffic is served.
5. To seed demo data, point your local `.env` at the Neon `DATABASE_URL` and run `npm run db:seed` locally.

> **Note:** The free Render plan spins down after 15 minutes of inactivity. The first request after inactivity may take 30–50 seconds.

### Step 3 — Frontend (Netlify)

1. Create a new site on Netlify and connect the frontend GitHub repo.
2. Leave **Base directory** empty. Netlify auto-detects `netlify.toml`:
   - **Build**: `npm ci && npm run build`
   - **Publish**: `dist`
3. Set this environment variable in the Netlify dashboard:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | Your Render backend URL + `/api/v1` |

4. Deploy. The `netlify.toml` includes a catch-all redirect so all client-side routes work correctly.
5. After deploying, update `CORS_ORIGIN` on Render to your Netlify URL and redeploy.

### Demo Accounts

All accounts use password `Password@123`.

| Email | Role | Access |
|---|---|---|
| `admin@example.com` | Admin | Full access |
| `analyst@example.com` | Analyst | Dashboard + read records |
| `viewer@example.com` | Viewer | Dashboard only |

## Assumptions

- Authentication is required before accessing protected endpoints.
- Roles determine what each user can read or modify.
- Financial records support filtering, aggregation, and soft delete.
- PostgreSQL is the source of truth for all persisted data.
