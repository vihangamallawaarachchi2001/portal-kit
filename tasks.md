# Bug Tracker

Bugs identified from QA testing. Check off each item as it is fixed.

---

## Dashboard

- [x] When dismissing the todo list widget, the "Read guide" and "Need help" helper divs also stay visible — they should be hidden at the same time
- [x] Dashboard header is not responsive on mobile — fixed: "Create" button hides text label on mobile (icon only), layout no longer overflows on narrow screens
- [x] Project dashboard: mobile view should use card layout, not tabular layout — fixed: useEffect switches to cards on mobile
- [x] Client dashboard: **Archive client** action is not working
- [x] Client dashboard: action buttons (edit, delete, etc.) only appear on hover — on mobile where there is no hover state, they are never accessible — fixed: defaults to card view on mobile
- [x] Client dashboard: mobile view should use card layout, not tabular layout — fixed: useEffect switches to cards on mobile (< 768px)

---

## Emails

- [x] Onboarding email: CTA button text is invisible — fixed by converting all email buttons from class-based to inline styles (Gmail-compatible)
- [x] Onboarding email: "Manage preferences" link should be removed — it is not needed

---

## Client Portal — Access & Auth

- [x] Portal magic link should create a **30-day cookie** and be **reusable up to 4 times** — cookie was already 30 days; added use_count to portal_sessions (migration 028), verify route now allows up to 4 uses
- [x] When a user arrives at the portal via a valid magic link, the "enter email" verification popup briefly flashes for a split second before being hidden — fixed: tokenStatus initializes as 'verifying' when token is in URL
- [x] Portal "enter email" form accepts **any** email and sends an access link — fixed: request-access route now returns an error for unknown emails; frontend shows the error message
- [ ] Freelancer should be able to **add multiple emails** to a single client portal. All email holders should receive the access link and be able to view the portal (for clients with multiple stakeholders/owners)

---

## Chat / Messages

- [x] **[CRITICAL]** Client portal: messages appear in real time. Freelancer dashboard chat: messages are **not** shown in real time — fixed: migration 027 adds messages table to supabase_realtime publication
- [ ] Chat is currently 1-to-1 (freelancer ↔ one client email). It needs to become a **group chat** so all email holders of a client account can message the freelancer. Display the sender's email address instead of a name (similar to WhatsApp group chat style)

---

## Files

- [x] Client-uploaded files incorrectly appear under **"Awaiting Review"** — fixed: migration 027 adds uploaded_by_client column; portal files route sets it true for client uploads; portal-file-review.tsx shows "Your uploads" section; file-manager.tsx shows "Client uploads" section without review buttons

---

## Invoices

- [x] **Invoice resend** returns a 500 error — fixed: `send()` now throws on Resend API error; resend route checks `sent === null` instead of `!sent` (undefined from void return was always falsy)

---

## Settings — Plan Badges

- [x] Business-plan users still see **"PRO"** and **"BUSINESS"** feature-gate badges throughout the settings UI — fixed in settings-nav (nav item badges) and notifications-settings ("Pro" badge on weekly digest)

---

## White-label / Branding

- [ ] The **"Hide PortalKit branding"** toggle has no visible effect because PortalKit branding is not currently present in portals, invoices, or emails. Two-part fix:
  1. Add PortalKit watermarks/footer attribution to portal pages, invoice PDFs, and email templates
  2. Make the toggle actually remove those marks for Business subscribers

---

## Teams

- [x] Teams invite form allows a user to **invite their own email** — fixed: team route now returns badRequest when inviting own email
- [ ] Account owner has **no UI to manage per-member permission scopes** — needs design before implementation
- [ ] Seat limits are not enforced: **Pro = 3 members**, **Business = 6 members**; extra seats should be charged at **$3/seat**
- [ ] Member visibility and access should vary based on permissions set by the account owner — needs full design/planning before implementation

---

## Portal Feature Controls (new)

- [x] Freelancer should be able to control what clients see in their portal — added "Portal Settings" tab in client detail view with per-feature toggles (files, invoices, messages, milestones, meetings). Disabled sections are hidden from the client's tab bar immediately. Migration 029 adds `portal_features` JSONB column to clients.

---

## Data Export

- [x] Export data fails with `TypeError: createArchive is not a function` — fixed: archiver v8 is pure ESM; replaced `require('archiver')` with `import { ZipArchive } from 'archiver'` and `new ZipArchive({...})`
