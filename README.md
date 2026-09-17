# Mana Store

Mana Store is a modular monolith for fashion and lifestyle ecommerce. The foundation keeps the web experience, business services, database access, and supplier integrations separated so additional suppliers can be added without coupling their APIs to the UI.

## Stack

- Next.js App Router and React
- TypeScript
- Tailwind CSS
- ESLint
- Prisma ORM with PostgreSQL
- Zod for runtime validation

## Prerequisites

- Node.js 20.9 or newer
- npm
- PostgreSQL 14 or newer

## Local setup

1. Install dependencies:

	```bash
	npm install
	```

2. Create a local environment file:

	```bash
	cp .env.example .env
	```

	On Windows PowerShell, use `Copy-Item .env.example .env`.

3. Set `DATABASE_URL` to a local PostgreSQL database. Keep `WEAVE365_API_KEY` server-side and use a real value only when the integration is implemented.

4. Generate the Prisma client and apply the current schema:

	```bash
	npm run db:generate
	npm run db:push
	```

5. Start the development server:

	```bash
	npm run dev
	```

	Open `http://localhost:3000`. The health endpoint is available at `http://localhost:3000/api/health`.

## Useful commands

```bash
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript without emitting files
npm run db:studio  # Open Prisma Studio
npm run build      # Create a production build
```

## Project structure

```text
app/             Next.js routes, layouts, pages, and route handlers
components/      Shared presentational UI components
config/           Central application configuration
database/         Prisma client and database access
lib/              Server configuration and shared error utilities
services/         Application use cases and orchestration
suppliers/        Supplier adapters and supplier-specific code
types/            Shared TypeScript domain types
validations/      Zod schemas for runtime input validation
prisma/           Prisma schema and migrations
```

`SupplierAdapter` defines the common supplier contract. `Weave365Adapter` is only a typed skeleton; no Weave 365 API calls or synchronization logic have been implemented yet. Supplier credentials are read from server environment variables and must never be exposed to client components.