# Apply `staff` table migration (Supabase)

This file explains how to apply the SQL migration that creates the `public.staff` table required by `ecommerce-admin`.

Recommended steps

1) Run in Supabase SQL editor (or using `psql` / supabase CLI):

   - Using the Supabase web SQL editor: open your project, go to SQL editor, paste the SQL from `db/migrations/2025-12-26_create_staff_table.sql` and run it.

   - Using `psql` (example):

```powershell
# Example (replace placeholders with your values)
psql "host=<DB_HOST> port=5432 user=<DB_USER> dbname=<DB_NAME> password=<DB_PASSWORD>" -f "db/migrations/2025-12-26_create_staff_table.sql"
```

   - Using `supabase` CLI (if configured):

```powershell
# from repo root
supabase db remote set <YOUR_DB_CONNECTION_URL>
supabase db query < db/migrations/2025-12-26_create_staff_table.sql
```

2) Verify table exists

```sql
SELECT id, email, full_name, role, created_at FROM public.staff LIMIT 10;
```

3) After migration (recommended)

- If you used the Supabase service role key to perform app-side imports or migrations, rotate `SUPABASE_SERVICE_ROLE_KEY` afterwards and update env vars deployed to your hosting (Vercel, etc.).
- Ensure `ecommerce-admin` environment contains:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
  - Cloudinary credentials if using uploads

4) Next steps for me (assistant)

- After you run the migration and confirm the table exists, I will implement the staff server-actions (create/edit/delete/list) in `ecommerce-admin` and wire the UI.
