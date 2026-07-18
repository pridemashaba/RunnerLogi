-- Add logout tracking to login history
ALTER TABLE user_login_history ADD COLUMN IF NOT EXISTS logged_out_at TIMESTAMP WITH TIME ZONE;
