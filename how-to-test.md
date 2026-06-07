# How to Test

## Project Limit Enforcement (Free Plan)

**Setup:** Ensure your account is on the `free` plan. Run in Supabase SQL editor:
```sql
UPDATE profiles SET plan = 'free' WHERE id = '<your-user-id>';
```

**Test 1 — Limit blocks creation:**
1. Create 2 projects (on any client)
2. Click "New Project" and try to create a 3rd
3. Expected: Modal form swaps to upgrade gate showing "You've used 2 of 2 projects on the Free plan" with an "Upgrade to Pro" button

**Test 2 — Limit resets after delete:**
1. Delete one of the existing projects (soft-delete via the dashboard)
2. Try creating a new project again
3. Expected: Modal works normally — only non-deleted projects count toward the limit

**Test 3 — Pro plan bypasses gate:**
```sql
UPDATE profiles SET plan = 'pro' WHERE id = '<your-user-id>';
```
Create more than 2 projects — should work with no gate.

**Test 4 — Upgrade button navigates correctly:**
Click "Upgrade to Pro" in the gate → should navigate to `/dashboard/settings/billing` and close the modal.

---

## Invoice Gating (Pro+ Only)

**Setup:** Set your account to the free plan:
```sql
UPDATE profiles SET plan = 'free' WHERE id = '<your-user-id>';
```

**Test 1 — Gate appears immediately on button click:**
1. Go to any client → Invoices tab
2. Click "New invoice"
3. Expected: Modal opens directly to the upgrade gate ("Invoicing is a Pro feature") — no form shown

**Test 2 — Gate also triggers on API bypass attempt:**
1. While on free plan, POST directly to `/api/clients/<id>/invoices` with a valid body
2. Expected: `402 Payment Required` with `{ "code": "invoice_gating" }` in the response

**Test 3 — Pro plan can create invoices:**
```sql
UPDATE profiles SET plan = 'pro' WHERE id = '<your-user-id>';
```
Click "New invoice" → form opens normally, invoice creates successfully.

**Test 4 — Upgrade button navigates correctly:**
Click "Upgrade to Pro" in the gate → navigates to `/dashboard/settings/billing` and closes the modal.

---

## Team Members (Business Plan, 5 Seats)

**Run the migration first:**
```sql
-- Run supabase/migrations/008_team_invites.sql in Supabase SQL editor
```

**Setup — Business plan:**
```sql
UPDATE profiles SET plan = 'business' WHERE id = '<your-user-id>';
```

**Test 1 — Gate shown for non-Business:**
```sql
UPDATE profiles SET plan = 'free' WHERE id = '<your-user-id>';
```
Go to Settings → Team. Expected: upgrade gate shown, no invite form.

**Test 2 — Invite a member:**
1. Switch to Business plan (SQL above)
2. Go to Settings → Team
3. Enter an email address and click "Send invite"
4. Expected: member appears in the list with "Pending" badge; check email inbox for invite

**Test 3 — Seat limit at 5:**
Invite 5 different email addresses. On the 6th, expected: toast error "Seat limit reached (5 max)". Invite form disappears when all seats are used.

**Test 4 — Remove a member:**
Hover a member row → click the trash icon. Expected: member removed from list, seat freed.

**Test 5 — Accept invite link:**
1. Copy the `accept_url` from the invite email: `/team-invite/accept?token=<token>`
2. Open it in a browser (no login needed)
3. Expected: success screen "Invitation accepted! Sign in to get started."

**Test 6 — Duplicate invite blocked:**
Invite the same email twice. Expected: toast "This email has already been invited."

**Test 7 — Settings nav shows Team:**
Go to Settings. Expected: "Team" item visible in the left nav with a "Business" badge.

---

## Custom Domain (Pro+ Plans)

**Run the migration first:**
```sql
-- Run supabase/migrations/009_custom_domain.sql in Supabase SQL editor
```

**Test 1 — Gate shown for free plan:**
```sql
UPDATE profiles SET plan = 'free' WHERE id = '<your-user-id>';
```
Go to Settings → Portal. Expected: upgrade gate shown, no domain input.

**Test 2 — Save a custom domain:**
```sql
UPDATE profiles SET plan = 'pro' WHERE id = '<your-user-id>';
```
1. Go to Settings → Portal
2. Enter `portal.yourdomain.com` and click Save
3. Expected: domain saved; DNS instructions card appears with CNAME record to add

**Test 3 — Copy CNAME target:**
Click the copy button next to the CNAME value. Expected: `portals.portalkit.io` copied to clipboard.

**Test 4 — Verify button (DNS not configured):**
Click Verify without setting up DNS first.
Expected: toast "DNS not configured yet. Add a CNAME record…" — verified badge stays red.

**Test 5 — Remove domain:**
Click the trash icon next to the Save button.
Expected: domain cleared, DNS instructions disappear.

**Test 6 — API-level gating:**
While on free plan, PATCH `/api/settings/portal` with `{ "custom_domain": "test.example.com" }`.
Expected: `402 Payment Required` with `{ "code": "domain_gating" }`.

**Test 7 — Settings nav shows Portal:**
Go to Settings. Expected: "Portal" item in left nav with a "Pro" badge.

---

## White-label Branding Removal (Business Plan)

**Run the migration first:**
```sql
-- Run supabase/migrations/010_white_label.sql in Supabase SQL editor
```

**Test 1 — Upgrade gate for non-Business:**
```sql
UPDATE profiles SET plan = 'pro' WHERE id = '<your-user-id>';
```
Go to Settings → Portal → White-label card.
Expected: upgrade gate shown ("White-label requires the Business plan").

**Test 2 — Toggle hides branding:**
```sql
UPDATE profiles SET plan = 'business' WHERE id = '<your-user-id>';
```
1. Go to Settings → Portal → toggle "Hide PortalKit branding" ON
2. Open a client portal `/p/<slug>/access`
3. Expected: "Secured by PortalKit" footer is gone

**Test 3 — Portal header badge removed:**
1. With hide_branding ON, log into a client portal
2. Expected: "PortalKit" badge in the top-right header is gone

**Test 4 — Toggle OFF restores branding:**
Toggle the switch back OFF → reload the portal access page.
Expected: "Secured by PortalKit" footer reappears.

**Test 5 — API-level gating:**
While on Pro plan, PATCH `/api/settings/portal` with `{ "hide_branding": true }`.
Expected: `402` with `{ "code": "whitelabel_gating" }`.

---

## Advanced Analytics (Business Plan)

**Test 1 — Upgrade gate for non-Business:**
```sql
UPDATE profiles SET plan = 'pro' WHERE id = '<your-user-id>';
```
Go to Dashboard → Analytics (sidebar).
Expected: upgrade gate shown with "Upgrade to Business" button.

**Test 2 — Analytics loads for Business:**
```sql
UPDATE profiles SET plan = 'business' WHERE id = '<your-user-id>';
```
Go to Dashboard → Analytics.
Expected: charts load — revenue bar chart, client growth line chart, project pie chart, invoice breakdown, file approval donut.

**Test 3 — Revenue chart shows paid invoices:**
Create and mark an invoice as paid (via Stripe webhook or direct SQL):
```sql
UPDATE invoices SET status = 'paid', paid_at = NOW() WHERE freelancer_id = '<your-user-id>';
```
Reload analytics — revenue chart should show the amount in the current month column.

**Test 4 — API-level gating:**
While on Pro plan, GET `/api/analytics`.
Expected: `402 Payment Required` with `{ "code": "analytics_gating" }`.

**Test 5 — Analytics sidebar item:**
Go to dashboard. Expected: "Analytics" item visible in the left sidebar with a chart icon.

---

## Weekly Digest Email (Pro+)

**Setup — env var:**
Add to `.env.local`:
```
CRON_SECRET=your-random-secret-here
```

**Test 1 — Toggle weekly digest in settings:**
```sql
UPDATE profiles SET plan = 'pro' WHERE id = '<your-user-id>';
```
Go to Settings → Notifications → toggle "Weekly digest" ON.
Expected: saved to DB (check `profiles.notification_preferences.weekly_digest = true`).

**Test 2 — Manual trigger:**
```bash
curl -X POST http://localhost:3000/api/digest/weekly \
  -H "x-cron-secret: your-random-secret-here"
```
Expected: `{ "ok": true, "sent": 1, "eligible": 1 }` — check email inbox.

**Test 3 — Unauthorized request blocked:**
```bash
curl -X POST http://localhost:3000/api/digest/weekly
```
Expected: `401 Unauthorized`.

**Test 4 — Free plan users not included:**
```sql
UPDATE profiles SET plan = 'free' WHERE id = '<your-user-id>';
```
Trigger the digest. Expected: `{ "sent": 0, "eligible": 0 }`.

**Test 5 — Cron schedule (production only):**
Deploy to Vercel. In Vercel dashboard → Settings → Crons, verify the weekly job at `0 8 * * 1` (Mondays 08:00 UTC) is listed and active.

---

## DB Migrations Checklist

Run all migrations in Supabase SQL editor in order:
- `supabase/migrations/008_team_invites.sql` — team_invites table
- `supabase/migrations/009_custom_domain.sql` — custom_domain columns
- `supabase/migrations/010_white_label.sql` — hide_branding column
