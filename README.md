# IdeaForge AI

IdeaForge AI is a full-stack AI SaaS starter inspired by `production/week1/day2.md`.
It generates structured SaaS business ideas through a Next.js frontend and a FastAPI
streaming backend.

## Stack

- Next.js Pages Router
- TypeScript
- Tailwind CSS
- FastAPI
- OpenAI streaming responses
- Markdown rendering

## Local setup

```bash
npm install
cp .env.local.example .env.local
```

Add your OpenAI key to `.env.local` if you want real model responses. Without the
key, the backend streams a local fallback response so the UI remains testable.

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
API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

For frontend-only work without the Python API:

```bash
npm run dev
```

## Deploy

```bash
vercel link
vercel env add OPENAI_API_KEY
vercel --prod
```

## Notes

The API supports both `/api` and `/api/idea` so it works with the Day 2 route and
with this project's parameterized frontend.
