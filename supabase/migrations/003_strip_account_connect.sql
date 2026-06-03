ALTER TABLE profiles
ADD COLUMN stripe_connect_account_id TEXT UNIQUE,
ADD COLUMN stripe_connect_enabled BOOLEAN DEFAULT FALSE;