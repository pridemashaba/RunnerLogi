-- RunnerLogi login tracking
-- Records each successful login so admins can see how many times users have logged in.

CREATE TABLE IF NOT EXISTS user_login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON user_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_logged_in_at ON user_login_history(logged_in_at);
