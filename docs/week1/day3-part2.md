# Day 3 Part 2: Clerk Billing Activities

This checklist tracks the subscription work added to IdeaForge AI.

## Goal

Add paid subscription access to the authenticated idea generator using Clerk Billing.

## Activities

1. Enable Clerk Billing in the Clerk Dashboard.
2. Create a subscription plan with key `premium_subscription`.
3. Set the plan name to `Premium Subscription`.
4. Set monthly pricing to `$10`.
5. Add the plan description: `Unlimited AI-powered business ideas`.
6. Gate `/product` with Clerk's `Protect` component.
7. Show Clerk's `PricingTable` to signed-in users without the premium plan.
8. Show the idea generator only to users with an active premium subscription.
9. Update the landing page to present the premium subscription model.
10. Allow users to manage account and billing from `UserButton`.
11. Deploy to Vercel after Clerk Billing is configured.
12. Test the production flow: sign in, open `/product`, subscribe, and generate an idea.

## Clerk Plan

The plan key must match the code exactly:

```text
premium_subscription
```

If this key differs in Clerk, `/product` will keep showing the pricing fallback or Clerk may report that the plan was not found.

## Local Validation

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

For local end-to-end testing, run FastAPI and Next.js in separate terminals:

```bash
npm run api
```

```bash
npm run dev
```

Then open:

```text
http://localhost:3000/product
```

## Required Environment

Local `.env.local` needs:

```bash
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_JWKS_URL=your_clerk_jwks_url_here
API_BASE_URL=http://127.0.0.1:8000
```

For Vercel, configure at least:

```bash
OPENAI_API_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_JWKS_URL
API_BASE_URL
```
