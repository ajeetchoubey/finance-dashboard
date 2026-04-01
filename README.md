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

## Assumptions

- Authentication is required before accessing protected endpoints.
- Roles determine what each user can read or modify.
- Financial records support filtering, aggregation, and soft delete.
- PostgreSQL is the source of truth for all persisted data.
