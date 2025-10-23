# Multi-Org Task API 

A multi-organization task API with JWT auth and org-scoped RBAC. Open signup supports creating an org (admin) or joining via join code (user).

## Environment

Create `server/.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require"
JWT_SECRET="replace-with-strong-secret"
NODE_ENV="development"
```

## Install & Run (Local)

```
pnpm i
pnpm prisma:generate
pnpm prisma:migrate
pnpm start:dev
```

- Health: GET http://localhost:3000/health

## API Summary

- Auth
  - POST `/auth/register` { mode: create|join, name, email, password, orgName?, joinCode? }
  - POST `/auth/login` { email, password }
  - GET `/auth/me`
- Tasks (org-scoped)
  - GET `/tasks`
  - POST `/tasks`
  - GET `/tasks/:id`
  - PATCH `/tasks/:id`
  - DELETE `/tasks/:id`
- Org (admin within org)
  - GET `/org`
  - PATCH `/org` { name }
  - GET `/org/users`
  - PATCH `/org/users/:userId/role` { role }

## Postman

- Import: `postman/MultiOrgTaskAPI.postman_collection.json`
- Set only `base_url` in environment. Collection scripts auto-capture `token`, `userId`, `orgId`, `joinCode`, `taskId`.

## Deploy (Vercel)

1. Set env vars: `DATABASE_URL`, `JWT_SECRET`.
2. Build command example:

```
prisma generate && prisma migrate deploy && npm run build
```

3. `vercel.json` routes all requests to `api/index.ts`. The function boots Nest once and uses the Express instance.

## Notes

- Don’t commit real secrets. Use `.env` locally and Vercel dashboard in cloud.
