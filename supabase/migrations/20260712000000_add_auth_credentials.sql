-- RunnerLogi custom auth (Neon Postgres)
-- Password credentials live on the users table, matching the register screen
-- (name, email, phone, password).

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Remove the previously used separate credentials table, if present.
DROP TABLE IF EXISTS auth_credentials;
