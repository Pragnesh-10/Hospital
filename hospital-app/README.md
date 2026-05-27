This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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
create a file .env while running the application locally on your computer
```bash
DATABASE_URL="enter url here"
NEXT_PUBLIC_SUPABASE_URL="enter url here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="enter url here"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="enter url here"
DATABASE_URL="enter url here"
DIRECT_URL="enter url here"
SUPABASE_SERVICE_ROLE_KEY="enter url here"
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Dev Admin Setup
To create an admin user manually, run this SQL in your Supabase SQL editor:
```sql
-- Replace the ID with your actual auth.users ID after signing up
INSERT INTO public.users (id, role) 
VALUES ('your-auth-user-id-here', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```
