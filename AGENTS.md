# Repository guide

This is a living guide for human and AI contributors. Update it in the same change when a new convention, required command, deployment dependency, integration, or architectural decision would otherwise be easy to miss. Keep it concise and factual; remove instructions that are no longer true.

## Stack

- NestJS 11 with TypeScript
- PostgreSQL via TypeORM
- Docker Compose for local PostgreSQL

## Collaboration protocol

- Read this file before making changes.
- Inspect the current working tree before editing; preserve unrelated user changes.
- Explain assumptions and report files changed plus verification performed.
- Prefer small, scoped changes with tests. Do not make external deployments, database resets, or credential changes without explicit authorization.
- When introducing a dependency, service, environment variable, command, or recurring operational task, update this guide and `.env.example` when applicable.
- Record durable project decisions here, not transient task notes or secrets.

## Local development

1. Copy `.env.example` to `.env` if it does not exist.
2. Start PostgreSQL with `docker compose up -d`.
3. Start the API with `npm.cmd run start:dev` on Windows.
4. Verify dependencies with `GET http://localhost:3000/api/health`.

Do not commit `.env`, database credentials, generated build output, or `node_modules`.

## Configuration

- All runtime configuration is validated in `src/config/environment.validation.ts`.
- Use individual `DATABASE_*` variables for local PostgreSQL.
- For managed PostgreSQL, prefer `DATABASE_URL` and set `DATABASE_SSL=true`.
- Keep `DATABASE_SSL_REJECT_UNAUTHORIZED=true` in production.
- Set `CORS_ORIGINS` to the exact comma-separated browser origins. Do not use a wildcard with credentials.
- Swagger/OpenAPI is enabled by default outside production. Use `SWAGGER_ENABLED` to control it; do not expose API documentation in production unless it is intentionally protected.
- Authenticated user endpoints verify Supabase access tokens through `SUPABASE_URL` and use `SUPABASE_JWT_AUDIENCE` (default `authenticated`). Configure the Supabase project URL before using `/api/me` or `/api/admin/*`.

## Code and data conventions

- Use four spaces for indentation. Prettier is the source of truth for formatting.
- Use `camelCase` for TypeScript variables, function names, DTO properties, entity properties, API JSON fields, and filenames. Use `PascalCase` for classes, interfaces, types, and enums.
- Environment variables are the exception: use conventional `UPPER_SNAKE_CASE` names.
- Use `snake_case` for PostgreSQL table and column names, mapped explicitly from camelCase entity properties. This keeps TypeScript and API contracts idiomatic while following conventional SQL naming.

## Database rules

- `synchronize` must remain `false` in all environments.
- Every schema change requires a reviewed TypeORM migration in `src/database/migrations`.
- Adding a field is safe through an additive migration. For renames or removals, use a staged migration: deploy compatible code, backfill or migrate data, then remove the deprecated field in a later release.
- Specify nullability, defaults, indexes, foreign keys, and rollback behavior deliberately in each migration. Avoid irreversible destructive changes where a safe staged approach is possible.
- Run `npm.cmd run migration:run` after building and before deploying the API.
- Never run destructive migration commands or delete database volumes without explicit user approval.

## API conventions

- The global API prefix is `/api`.
- Keep DTOs explicit and decorate their fields for validation. The global validation pipe rejects unknown fields.
- New modules should use Nest module/controller/service structure.
- Register entities with `TypeOrmModule.forFeature` in their owning module.
- The `users` table is provisioned lazily from a verified Supabase `sub` and `email` on first `/api/me` request. A nickname and public slug are optional at provision time and are claimed together through `PATCH /api/me`; do not trust client-supplied authentication IDs.
- Preserve the health endpoint at `GET /api/health` and avoid adding authentication to it unless deployment infrastructure is updated accordingly.
- Document every public endpoint with `@nestjs/swagger` decorators. The interactive documentation is available at `/api/docs` when enabled; keep README route information limited to operational endpoints and documentation access.

## Quality checks

Run before handing off changes:

```powershell
npm.cmd run build
npm.cmd test -- --runInBand
```

## Production checklist

- Provide secrets through the deployment platform, not committed files.
- Run migrations as a separate deployment step before the application starts.
- Use a managed PostgreSQL service with backups, TLS, monitoring, and a paid production plan.
- Keep the container image and npm dependencies patched.
- PM2 uses `ecosystem.config.cjs`. Run `npm.cmd run pm2:add` to build and start or reload the `card-game-api` production process, and `npm.cmd run pm2:remove` to delete it. The PM2 configuration intentionally uses its documented snake_case option names.
