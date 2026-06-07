-- Push notification subscriptions for both freelancers and portal clients
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_type TEXT        NOT NULL CHECK (subscriber_type IN ('freelancer', 'client')),
  subscriber_id   UUID        NOT NULL,  -- freelancer: auth user id, client: clients.id
  endpoint        TEXT        NOT NULL,
  keys            JSONB       NOT NULL,  -- { p256dh, auth }
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subscriber_id, endpoint)
);

-- Freelancers can manage their own subscriptions; clients use service role
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "freelancer_own_subscriptions" ON public.push_subscriptions
  FOR ALL USING (
    subscriber_type = 'freelancer'
    AND subscriber_id = auth.uid()
  );
