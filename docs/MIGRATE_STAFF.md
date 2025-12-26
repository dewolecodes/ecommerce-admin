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

Security & multi-tenant considerations (important)

- Each staff record must be tied to a single merchant (tenant). The migration creates a `merchant_id` column for this purpose. Ensure every staff row you create includes `merchant_id`.
- Never reuse the Supabase service role key on the client. Use it only in server actions and server-side helpers.
- Use Supabase Row-Level Security (RLS) policies to prevent cross-tenant access. See example RLS policies below.

Invitation & login flows (recommended)

There are two common patterns to let a merchant add staff and enable staff login:

1) Invite-first (recommended)
    - Merchant enters staff email + role in the dashboard "Team" page.
    - Your server action (using the service role key) inserts a `staff` row with `status = 'invited'`, sets `invited_at`, and generates a short-lived `invite_token`.
    - Send an email to the staff member with a link to the admin app containing the token (e.g. `/staff/accept-invite?token=...`).
    - When the staff clicks the link, they complete account setup. You can:
       - Use Supabase Auth magic link: send a magic link to the staff email, then on first sign-in associate the `auth.uid` with the `staff.auth_user_id` and set `status = 'active'` and `merchant_id` (server-side).
       - Or, create the user immediately via Supabase Admin API and let them set a password via an invite flow.

2) Create-auth-user-first
    - Use the Supabase Admin API (service role) to create an auth user for the staff email and optionally send a welcome email.
    - Create the `staff` row including `auth_user_id` and `merchant_id`, then the staff can sign in immediately with the created account.

Which to choose
- Invite-first is simpler and keeps control in the app — merchant initiates invite, and the staff completes signup. It avoids creating auth users for emails that never accept invites.
- Create-user-first is useful if you need to pre-provision accounts and control initial passwords.

Permissions & roles

- Roles determine what staff can do inside a merchant's dashboard. Typical roles:
   - `owner` — full access, can manage billing, delete merchant, manage roles.
   - `admin` — manage products/categories/orders/customers, manage staff (but not owner-only settings).
   - `manager` — limited management (e.g., products and orders) but not staff/billing.
   - `viewer` — read-only access.

- Implement role-based checks on the server (server-actions) and on the client UI (hide/show buttons). The server-side checks are the source of truth — client-side enforcement is only UX.

Row-Level Security (RLS) example (Supabase SQL)

After you create the `staff` table, enable RLS on tables that contain merchant-specific data (products, orders, customers, staff table itself). Example SQL:

```sql
-- Example: allow a signed-in user to access only rows matching their merchant_id
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy that allows service role or owner system jobs
CREATE POLICY "Service role bypass" ON public.products
   FOR ALL
   USING ( current_setting('jwt.claims.role', true) = 'service' );

-- Policy for authenticated users whose session includes `merchant_id` in JWT claims
-- (This requires your auth process to set jwt claims or you can check staff.auth_user_id -> staff.merchant_id inside a function)
CREATE POLICY "Users can access merchant data" ON public.products
   FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.staff s WHERE s.auth_user_id = auth.uid() AND s.merchant_id = products.merchant_id AND s.status = 'active')
   );
```

Notes about JWT claims and auth.uid()
- If you use Supabase Auth, `auth.uid()` is available in RLS policies to get the currently signed-in user's `uid`.
- The example above queries the `staff` table to map `auth.uid()` to a `merchant_id` and verifies `status = 'active'`. This pattern enforces that a user can only access data for the merchant(s) they belong to.

UX: How a merchant adds staff (suggested UI)

- "Team" page: list current staff (email, role, status), "Invite staff" button.
- Invite modal: input email, role dropdown, optional note. On submit, call server-action `inviteStaff(email, role)`.
- The invited staff receives an email with a link. On accept, they create or confirm their account and the app associates their `auth.uid` with the `staff` record.

Behavior questions answered

- "Can a merchant access another merchant's dashboard?" No — with `merchant_id` on records and RLS policies, neither merchants nor staff can access other merchants' data.

- "How can staff login?" Staff login using the same authentication provider as merchant owners (Supabase Auth). The difference is that on successful sign-in the app verifies the user's `uid` is associated with one or more `staff` rows and only shows merchants the user belongs to.

- "Can staff see everything? Can they perform all actions?" That depends on role. Assign fine-grained roles and enforce them server-side. For example, a `viewer` role will only be allowed SELECT, while `admin` can create/update/delete.

4) Next steps for me (assistant)

- After you run the migration and confirm the table exists, I will implement the staff server-actions (create/edit/delete/list) in `ecommerce-admin` and wire the UI.
