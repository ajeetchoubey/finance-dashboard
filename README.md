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

The backend is deployed on [Render](https://render.com) with a [Neon](https://neon.tech) PostgreSQL database. The frontend is deployed on [Netlify](https://netlify.com).