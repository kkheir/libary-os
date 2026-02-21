# Mini Library Management System (Next.js)

A full-stack job-test project built with Next.js App Router, Prisma, SQLite, and NextAuth.

## Features

- Book management (`ADMIN`): add, edit, delete books
- Check-in / check-out workflow:
	- `Borrow` = check-out
	- `Return` = check-in
- Search books by title, author, genre, ISBN, and description
- Authentication:
	- Credentials (email/password)
	- GitHub SSO (optional, env-based)
- Role-based access control:
	- `ADMIN`: full CRUD + all return permissions
	- `MEMBER`: browse/search + borrow + return own borrowed books
- AI feature:
	- `/api/ai/recommendations` provides relevance-scored recommendations and reasoning from free-text interests
- Seed data and demo accounts included

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Prisma 6 + SQLite
- NextAuth 4
- Tailwind CSS

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

3. Run migrations + seed

```bash
npm run db:migrate
npm run db:seed
```

4. Start development server

```bash
npm run dev
```

5. Open:

- http://localhost:3003

## Demo Credentials (seeded)

- Admin:
	- Email: `admin@library.local`
	- Password: `Admin123!`
- Member:
	- Email: `member@library.local`
	- Password: `Member123!`

## Environment Variables

See `.env.example`.

Required:
- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

Optional:
- `GITHUB_ID`
- `GITHUB_SECRET`
- `ADMIN_EMAILS` (comma-separated)

## Scripts

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run start` – run production server
- `npm run lint` – lint
- `npm run db:migrate` – run Prisma migrations
- `npm run db:seed` – seed database

## API Overview

- `POST /api/register`
- `GET /api/books?q=...`
- `POST /api/books` (`ADMIN`)
- `PUT /api/books/:id` (`ADMIN`)
- `DELETE /api/books/:id` (`ADMIN`)
- `POST /api/books/:id/checkout`
- `POST /api/books/:id/checkin`
- `GET /api/ai/recommendations?q=...`

## Deployment (Vercel)

This environment could not complete deployment because the Vercel token/login is not available.

Deploy from your machine/account:

1. `npx vercel login`
2. `npx vercel --prod`
3. Add production env vars in Vercel dashboard
4. Run migrations in deployment environment if needed

After deploy, your live URL will be provided by Vercel (for example: `https://your-project.vercel.app`).
