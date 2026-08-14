# IdeaForge AI

IdeaForge AI is a full-stack AI SaaS starter inspired by `production/week1/day2.md`.
It generates structured SaaS business ideas through a Next.js frontend and a FastAPI
streaming backend. The app now includes Clerk authentication and Clerk Billing
subscription gating for premium access.

## Stack

- Next.js Pages Router
- TypeScript
- Tailwind CSS
- FastAPI
- Clerk authentication
- Clerk Billing
- OpenAI streaming responses
- Markdown rendering

## Local setup

```bash
npm install
cp .env.local.example .env.local
```

Add your OpenAI and Clerk keys to `.env.local`. Without `OPENAI_API_KEY`, the backend
streams a local fallback response so the UI remains testable. Clerk auth and billing
require real Clerk development keys.

For Vercel-style local testing:

```bash
vercel dev
```

For local Next.js plus FastAPI testing, run these in two terminals:

```bash
pip install -r requirements.txt
npm run api
```

```bash
npm run dev
```

For frontend-only work without the Python API:

```bash
npm run dev
```

## Deploy

```bash
vercel link
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add CLERK_JWKS_URL
vercel env add API_BASE_URL
vercel --prod
```

## Week 1 Activities

- [Day 3 Part 2: Clerk Billing](docs/week1/day3-part2.md)

## Notes

The API supports both `/api` and `/api/idea` so it works with the Day 2 route and
with this project's parameterized frontend.
