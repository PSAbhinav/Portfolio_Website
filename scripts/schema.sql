CREATE TABLE IF NOT EXISTS portfolio_content (
 id integer PRIMARY KEY CHECK(id=1), published jsonb, draft jsonb, revision integer NOT NULL DEFAULT 0, published_at timestamptz
);
INSERT INTO portfolio_content(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS admin_totp (
 google_sub text PRIMARY KEY, secret text NOT NULL, enabled boolean NOT NULL DEFAULT false, pending_expires timestamptz,
 last_counter bigint NOT NULL DEFAULT -1, attempts integer NOT NULL DEFAULT 0, window_start timestamptz NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS admin_sessions (
 token_hash text PRIMARY KEY, google_sub text NOT NULL, google_sid text NOT NULL, expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry ON admin_sessions(expires_at);
CREATE TABLE IF NOT EXISTS admin_login_attempts (
 key text PRIMARY KEY, attempts integer NOT NULL DEFAULT 0, window_start timestamptz NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS content_history (
 id bigserial PRIMARY KEY, content jsonb NOT NULL, published_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS portfolio_media (
 id uuid PRIMARY KEY, content_type text NOT NULL, data_base64 text NOT NULL, created_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS analytics_events (
 id uuid PRIMARY KEY, session_hash text NOT NULL, kind text NOT NULL, target text NOT NULL, country text NOT NULL, city text NOT NULL, referrer text NOT NULL, device text NOT NULL, created_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS analytics_events_date ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS analytics_events_session ON analytics_events(session_hash, created_at);
CREATE TABLE IF NOT EXISTS contact_inbox (
 id uuid PRIMARY KEY, name text NOT NULL, email text NOT NULL, phone text NOT NULL, message text NOT NULL, delivery text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_totp ADD COLUMN IF NOT EXISTS recovery_hashes jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE contact_inbox ADD COLUMN IF NOT EXISTS error text NOT NULL DEFAULT '';
ALTER TABLE content_history ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 0;
