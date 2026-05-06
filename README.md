## Study Organizer (Next.js + Supabase + Vercel)

### Local dev

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Create the database table + RLS policies:
   - Open Supabase → SQL Editor → paste and run `supabase/schema.sql`
4. Run:

```bash
npm run dev
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Deploy (Vercel)

1. Push this folder to GitHub.
2. In Vercel: New Project → Import repo (framework auto-detects Next.js).
3. Add env vars in Vercel Project → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (optional, recommended) `NEXT_PUBLIC_SITE_URL` = `https://<your-vercel-domain>`
4. Deploy.

### Supabase Auth settings (required for magic link)

In Supabase → Auth → URL Configuration:

- Site URL: `https://<your-vercel-domain>`
- Redirect URLs:
  - `https://<your-vercel-domain>/auth/callback`
  - `http://localhost:3000/auth/callback`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
