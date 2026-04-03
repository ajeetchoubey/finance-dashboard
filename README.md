# Finance Dashboard Backend

Node.js + Express + TypeScript + PostgreSQL backend design for a finance dashboard with role-based access control, financial record management, and summary analytics.

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

- [High-Level Design](docs/hld.md)
- [Database Design](docs/db-schema.md)
- [API Specification](docs/api-spec.md)
- [Implementation Plan](docs/implementation-plan.md)
- [OpenAPI Spec](docs/openapi.yaml)
- [Seed Data](docs/seed-data.md)
- [Setup Guide](docs/setup.md)
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

The backend is deployed on [Render](https://render.com) with a [Neon](https://neon.tech) PostgreSQL database. The frontend is deployed on [Netlify](https://netlify.com).

### Database — Neon

1. Create a free project at [neon.tech](https://neon.tech).
2. From the **Connection Details** panel, copy both connection strings:
   - **Pooled connection string** → `DATABASE_URL` (used at runtime)
   - **Direct connection string** → `DIRECT_URL` (used for migrations; select *Unpooled* or remove `-pooler` from the host)

### Backend — Render

1. Push this repo to GitHub.
2. In Render, create a new **Web Service** and connect the repo.
3. Render will auto-detect `render.yaml`. Confirm the settings:
   - **Build command**: `npm ci && npm run prisma:generate && npm run build`
   - **Start command**: `npm run migrate:deploy && npm start`
4. Set the following environment variables in the Render dashboard:
   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled connection string |
   | `DIRECT_URL` | Neon direct connection string |
   | `JWT_SECRET` | A long random secret (or use Render's **Generate** option) |
   | `CORS_ORIGIN` | Your Netlify frontend URL, e.g. `https://your-app.netlify.app` |
5. Deploy. Render runs `prisma migrate deploy` on every start before serving traffic.
6. To seed demo data, open the Render **Shell** and run `npm run db:seed`.

### Frontend — Netlify

1. Push the frontend repo to GitHub.
2. In Netlify, create a new site from the repo.
3. Netlify will auto-detect `netlify.toml`. Confirm the settings:
   - **Build command**: `npm ci && npm run build`
   - **Publish directory**: `dist`
4. Set the following environment variable in the Netlify dashboard:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | Your Render backend URL, e.g. `https://your-api.onrender.com/api/v1` |
5. Deploy. The `netlify.toml` includes a catch-all redirect so client-side routing works correctly.

## Assumptions

- Authentication is required before accessing protected endpoints.
- Roles determine what each user can read or modify.
- Financial records support filtering, aggregation, and soft delete.
- PostgreSQL is the source of truth for all persisted data.
