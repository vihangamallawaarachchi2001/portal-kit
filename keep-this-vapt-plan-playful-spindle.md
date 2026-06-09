# Plan: Project Milestones + Meeting Scheduler (Google Meet)

## Why These Features Matter

PortalKit's current model is reactive — the client only hears from the freelancer when a file is uploaded or an invoice is sent. That leaves clients feeling out of the loop and freelancers manually chasing deadlines in their heads.

**Milestones** transform a project into a visible timeline both parties share. A client who can see "Design mockups due Friday — ✅ Delivered" trusts the engagement more, pushes back less, and pays faster. For the freelancer, automated reminders replace the cognitive tax of deadline tracking.

**Meetings** close the gap between async file reviews and live conversation. Right now there's no structured way to schedule a call inside the portal — freelancers share Meet links via email/WhatsApp outside the tool. Bringing that inside PortalKit makes it the single source of truth for the engagement.

Together these two features significantly deepen project engagement and differentiate PortalKit from simpler invoice-only tools.

---

## Codebase Context

- **Notification infrastructure** is already complete: `lib/web-push.ts` (push), `lib/email.ts` (11 Resend templates), `push_subscriptions` table, `notification_preferences` JSONB on profiles
- **Cron pattern** established at `app/api/digest/weekly/route.ts` + `app/api/cron/cleanup/route.ts` — auth via `CRON_SECRET` bearer token
- **Next migration number:** `019`
- **Client portal** lives at `app/p/[slug]/(portal)/` — authenticated via `portal_sessions` + `portal_client_id` cookie; clients have no Supabase auth
- **Existing notification preferences** keys: `messages`, `file_review`, `invoice_paid`, `status_change`, `weekly_digest`
- **UI patterns:** Dialog modals (`components/ui/dialog.tsx`), gradient header + scrollable body + sticky footer, Lucide icons, `ds-secondary` brand colour, `sonner` toasts
- **API helpers:** `ok()`, `badRequest()`, `unauthorized()`, `notFound()` from `lib/api.ts`
- **Push send:** `sendPushToSubscriber('freelancer'|'client', subscriberId, payload)` in `lib/web-push.ts`
- **Email send:** named functions in `lib/email.ts`, all follow same `send()` helper pattern

---

## Feature 1 — Project Milestones

### What gets built

A milestone is a named checkpoint inside a project with a due date and an optional description. The freelancer creates and manages milestones; the client sees them in the portal as a timeline. When a milestone is approaching or completed, both parties are notified automatically.

**Freelancer experience:**
- Milestones panel in the project detail page (new tab or expandable section)
- Create / edit / delete milestones inline
- Mark milestone as complete with one click
- Push + email reminder when a milestone is 7 days, 3 days, and 1 day away

**Client experience:**
- Read-only milestone timeline in the portal (under their project)
- Email notification when a milestone is marked complete ("Your freelancer has completed: Design Mockups ✅")
- Email notification when an upcoming milestone is near ("Coming up: Final delivery — 3 days away")

### Database — `019_milestones.sql`

```sql
CREATE TABLE public.milestones (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  freelancer_id UUID        NOT NULL REFERENCES public.profiles(id),
  title         TEXT        NOT NULL CHECK (char_length(title) <= 120),
  description   TEXT        CHECK (char_length(description) <= 500),
  due_date      DATE        NOT NULL,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_project    ON public.milestones(project_id);
CREATE INDEX idx_milestones_freelancer ON public.milestones(freelancer_id);
CREATE INDEX idx_milestones_due        ON public.milestones(due_date) WHERE completed_at IS NULL;

CREATE TRIGGER trg_milestones_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Freelancer owns and manages milestones
CREATE POLICY "milestones: freelancer full access"
  ON public.milestones FOR ALL
  USING  (freelancer_id = auth.uid())
  WITH CHECK (freelancer_id = auth.uid());

-- Client reads milestones on their projects via portal session
CREATE POLICY "milestones: client read"
  ON public.milestones FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE client_id = public.get_current_client_id()
        AND deleted_at IS NULL
    )
  );
```

Add two new preference keys to `notification_preferences` defaults (migration also updates existing rows):
```sql
ALTER TABLE public.profiles
  ALTER COLUMN notification_preferences
  SET DEFAULT '{"messages":true,"file_review":true,"invoice_paid":true,
                "status_change":false,"weekly_digest":false,
                "milestone_reminders":true,"milestone_client_notify":true}';
```

### API Routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/projects/[id]/milestones` | List milestones for a project |
| POST | `/api/projects/[id]/milestones` | Create milestone |
| PATCH | `/api/milestones/[id]` | Update title/date/description or mark complete |
| DELETE | `/api/milestones/[id]` | Delete milestone |

Auth: all routes use `createClient()` + `supabase.auth.getUser()` → verify `freelancer_id = user.id` before mutation.

Completing a milestone (`PATCH` with `completed_at: new Date().toISOString()`) triggers:
- `sendMilestoneCompletedEmail(clientEmail, clientName, freelancerName, milestoneTitle, projectTitle, portalUrl)` → client
- Push notification to client if subscribed

### Email Templates (add to `lib/email.ts`)

1. **`sendMilestoneCompletedEmail`** — to client
   - Subject: `✅ Milestone completed: {title}`
   - Body: Freelancer has marked "{milestone}" as complete on project "{project}". View your portal.
   - CTA: "Open Portal" → `portalUrl`

2. **`sendMilestoneReminderEmail`** — to freelancer
   - Subject: `⏰ Milestone due in {N} days: {title}`
   - Body: "{milestone}" on project "{project}" (client: {clientName}) is due on {date}.
   - CTA: "View Project" → `/dashboard/projects`

3. **`sendMilestoneClientUpcomingEmail`** — to client
   - Subject: `📅 Coming up: {title} — {N} days away`
   - Body: An upcoming milestone "{milestone}" is scheduled for {date} on your project "{project}".

### Cron Job — `app/api/cron/milestone-reminders/route.ts`

Schedule: `0 9 * * *` (daily at 09:00 UTC) — add to `vercel.json` crons.

Logic:
1. Verify `CRON_SECRET`
2. Query all incomplete milestones where `due_date` is in exactly 1, 3, or 7 days
3. For each: load project → client email → freelancer email + push subscription
4. Send `sendMilestoneReminderEmail` to freelancer + push notification
5. If `milestone_client_notify` pref is true, send `sendMilestoneClientUpcomingEmail` to client
6. Use service client (`createServiceClient()`) since this runs server-side outside auth

### UI Components

**Dashboard — `components/dashboard/milestone-manager.tsx`** (new Client Component)
- Collapsible section in the project detail view OR a "Milestones" tab
- Timeline list: due date → title → status chip (upcoming / overdue / done)
- Inline "Add milestone" button → small modal (title, due date, description optional)
- Check-circle button to mark complete, trash icon to delete
- Overdue milestones highlighted in amber/red
- Follow existing modal pattern from `create-project-modal.tsx`

**Client Portal — add to `app/p/[slug]/(portal)/page.tsx`**
- Read-only milestone timeline per project card
- Status: ✅ Completed (with date) | 🕐 Upcoming (with days remaining) | ⚠️ Overdue
- Subtle, doesn't clutter the existing project view

---

## Feature 2 — Meeting Scheduler (Google Meet)

### Design Decision: No Google OAuth (for now)

Auto-creating Google Meet links requires Google OAuth consent per user (each freelancer must authorize their Google account). That's a significant setup burden and adds OAuth complexity to the auth flow. More importantly, the core value of this feature is **scheduling + notifications + the shared link** — not who generated the link.

**Approach:** Freelancer pastes any video link (Google Meet, Zoom, Teams, Whereby — any URL). PortalKit owns the scheduling, reminder, and portal-sharing experience. This ships immediately and works for 100% of video platforms.

A flag in the UI ("Create Google Meet link") can open `https://meet.google.com/new` in a new tab — Google generates the link, freelancer copies it back. This is the zero-OAuth way to get a fresh Meet link in seconds.

Full Google Calendar API integration can be added later as a Phase 2 enhancement (documented at end of plan).

### What gets built

**Freelancer experience:**
- "Schedule Meeting" button per project (or per client)
- Modal: title, date + time, duration, optional description, video link (URL input), which client(s) to invite
- On save: invite email sent to client(s) with meeting details + link
- Meeting appears in project's meetings list
- Reminder push + email to freelancer 24h and 1h before
- Freelancer can mark meeting as completed or cancel it

**Client experience:**
- Invite email with meeting details, date/time, and "Join Meeting" button
- Meeting visible in their portal project view
- Reminder email 24h and 1h before meeting

### Database — `020_meetings.sql`

```sql
CREATE TABLE public.meetings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID        REFERENCES public.projects(id) ON DELETE SET NULL,
  freelancer_id UUID        NOT NULL REFERENCES public.profiles(id),
  client_id     UUID        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL CHECK (char_length(title) <= 150),
  description   TEXT        CHECK (char_length(description) <= 1000),
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_mins INTEGER     NOT NULL DEFAULT 30 CHECK (duration_mins BETWEEN 15 AND 480),
  meet_link     TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'scheduled'
                            CHECK (status IN ('scheduled','completed','cancelled')),
  invite_sent_at  TIMESTAMPTZ,
  reminder_24h_at TIMESTAMPTZ,
  reminder_1h_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meetings_freelancer ON public.meetings(freelancer_id);
CREATE INDEX idx_meetings_client     ON public.meetings(client_id);
CREATE INDEX idx_meetings_scheduled  ON public.meetings(scheduled_at)
  WHERE status = 'scheduled';

CREATE TRIGGER trg_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings: freelancer full access"
  ON public.meetings FOR ALL
  USING  (freelancer_id = auth.uid())
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "meetings: client read"
  ON public.meetings FOR SELECT
  USING (client_id = public.get_current_client_id() AND status != 'cancelled');
```

### API Routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/projects/[id]/meetings` | List meetings for a project |
| POST | `/api/projects/[id]/meetings` | Create meeting + send invite |
| PATCH | `/api/meetings/[id]` | Update / cancel / complete meeting |
| DELETE | `/api/meetings/[id]` | Hard delete (only if not yet invited) |

On `POST` (create): immediately send `sendMeetingInviteEmail` to client + freelancer confirmation.

On `PATCH` with `status: 'cancelled'`: send `sendMeetingCancelledEmail` to client.

### Email Templates (add to `lib/email.ts`)

1. **`sendMeetingInviteEmail`** — to client
   - Subject: `📅 Meeting scheduled: {title} on {date}`
   - Body: "{freelancerName} has scheduled a meeting with you. Details + "Join Meeting" CTA button → `meet_link`
   - Date/time displayed with duration ("Tuesday, June 10 at 3:00 PM · 45 minutes")

2. **`sendMeetingInviteConfirmEmail`** — to freelancer
   - Subject: `Meeting scheduled with {clientName}: {title}`
   - Confirmation of the invite sent, meeting details

3. **`sendMeetingReminderEmail`** — to both client and freelancer
   - Subject: `⏰ Meeting in {timeframe}: {title}`
   - "Join Meeting" CTA button → `meet_link`
   - Two versions called with appropriate timeframe string ("24 hours" / "1 hour")

4. **`sendMeetingCancelledEmail`** — to client
   - Subject: `Meeting cancelled: {title}`
   - Informational — no CTA

### Cron Job — `app/api/cron/meeting-reminders/route.ts`

Schedule: `0 * * * *` (every hour) — Netlify/Vercel external cron.

Logic:
1. Verify `CRON_SECRET`
2. Query meetings where `status = 'scheduled'`
3. For `scheduled_at` between now+23h and now+25h AND `reminder_24h_at IS NULL`:
   - Send reminder email to freelancer + client
   - Send push to both
   - Mark `reminder_24h_at = NOW()`
4. For `scheduled_at` between now+45min and now+75min AND `reminder_1h_at IS NULL`:
   - Send reminder to both
   - Push to both
   - Mark `reminder_1h_at = NOW()`
5. For `scheduled_at < NOW()` AND `status = 'scheduled'`: auto-set status to 'completed'

The `reminder_*h_at` sentinel columns prevent double-sending if the cron runs multiple times.

### UI Components

**`components/dashboard/meeting-scheduler.tsx`** (new Client Component)
- "Schedule Meeting" button → Dialog modal
- Modal fields: Title (required), Date + Time picker, Duration (15/30/45/60/90 min selector), Video link (URL, with "Open Google Meet" shortcut button that opens `https://meet.google.com/new`), Description (optional)
- Meeting list below: card per meeting showing title, date, client, status chip, "Join" link, cancel button
- Follow invoice-manager.tsx modal pattern

**Client portal — add to `app/p/[slug]/(portal)/page.tsx`**
- "Upcoming meetings" section per project (or global at top)
- Shows: date, time, title, "Join Meeting" button → `meet_link`
- Only shows `status = 'scheduled'` meetings in the future

---

## Notification Preference Keys (both features)

Add to `notification_preferences` JSONB defaults and `lib/notification-prefs.ts` (or equivalent):

```
milestone_reminders:     true   // freelancer push+email when milestone approaching
milestone_client_notify: true   // client email when milestone near/complete
meeting_reminders:       true   // freelancer push+email 24h+1h before meeting
```

Add these to the settings UI in `components/dashboard/notification-settings.tsx` (or wherever notification toggles live).

---

## Files to Create / Modify

### New files
| File | Purpose |
|---|---|
| `supabase/migrations/019_milestones.sql` | Milestones table + RLS |
| `supabase/migrations/020_meetings.sql` | Meetings table + RLS |
| `app/api/projects/[id]/milestones/route.ts` | GET + POST milestones |
| `app/api/milestones/[id]/route.ts` | PATCH + DELETE milestone |
| `app/api/projects/[id]/meetings/route.ts` | GET + POST meetings |
| `app/api/meetings/[id]/route.ts` | PATCH + DELETE meeting |
| `app/api/cron/milestone-reminders/route.ts` | Daily milestone cron |
| `app/api/cron/meeting-reminders/route.ts` | Hourly meeting cron |
| `components/dashboard/milestone-manager.tsx` | Milestone UI (dashboard) |
| `components/dashboard/meeting-scheduler.tsx` | Meeting UI (dashboard) |

### Modified files
| File | Change |
|---|---|
| `lib/email.ts` | Add 7 new email templates (milestone × 3, meeting × 4) |
| `app/p/[slug]/(portal)/page.tsx` | Add milestones timeline + upcoming meetings sections |
| `app/dashboard/projects/[id]/page.tsx` (or projects view) | Embed milestone-manager + meeting-scheduler |
| `vercel.json` | Add 2 new cron entries |
| `types/database.ts` | Add Milestone, Meeting types |

---

## Phase 2 (Future): Full Google Calendar Integration

When the team is ready to add Google OAuth:
1. Enable Google provider in Supabase Auth (Dashboard → Auth → Providers)
2. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` to env
3. Add `google_refresh_token` column to `profiles` table
4. On meeting creation, if freelancer has Google token: call Google Calendar API `events.insert` with `conferenceData.createRequest` to auto-generate Meet link
5. Store `google_event_id` on meeting for updates/cancellations

This is additive — the manual link flow continues to work for freelancers without Google connected.

---

## Verification Plan

1. **Migrations** — run `supabase db push` locally, verify tables + RLS with `supabase db diff`
2. **Milestone CRUD** — create, edit, complete, delete a milestone in the dashboard; verify it appears in the client portal
3. **Milestone notification** — mark a milestone complete → verify client receives email (check Resend dashboard)
4. **Milestone cron** — POST to `/api/cron/milestone-reminders` with `Authorization: Bearer $CRON_SECRET`; verify emails sent for due-in-1-day milestones
5. **Meeting creation** — create a meeting → verify both freelancer confirmation and client invite emails
6. **Meeting reminder cron** — POST to `/api/cron/meeting-reminders`; verify reminder emails sent for meetings in the right window, `reminder_24h_at` stamped, no double-send on re-run
7. **Client portal** — log into a test client portal, verify milestones and meetings are visible (read-only), "Join Meeting" link works
8. **Push notifications** — enable push in browser, complete a milestone, verify push appears
