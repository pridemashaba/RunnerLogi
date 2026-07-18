-- RunnerLogi Database Schema
-- PostgreSQL optimized for delivery logistics platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (covers all roles: seller, runner/courier, admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    password_hash TEXT,
    role VARCHAR(20) NOT NULL CHECK (role IN ('seller', 'runner', 'admin')),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- User profiles (extended business information)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'US',
    website VARCHAR(255),
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
    business_hours JSONB,
    default_pickup_address TEXT,
    default_return_address TEXT,
    stripe_customer_id VARCHAR(255),
    stripe_account_id VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_deliveries INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Addresses table (normalized for reuse)
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(100),
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'US',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Courier providers table
CREATE TABLE couriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) UNIQUE NOT NULL,
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    logo_url TEXT,
    base_rate DECIMAL(10,2),
    rate_per_kg DECIMAL(10,2),
    estimated_days INTEGER,
    service_level VARCHAR(20) CHECK (service_level IN ('economy', 'standard', 'express')),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courier rate zones
CREATE TABLE courier_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courier_id UUID NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
    zone_name VARCHAR(100) NOT NULL,
    zone_code VARCHAR(50) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    estimated_days INTEGER NOT NULL,
    UNIQUE(courier_id, zone_code)
);

CREATE INDEX idx_courier_zones_courier_id ON courier_zones(courier_id);

-- Deliveries table
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_number VARCHAR(50) UNIQUE NOT NULL,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    courier_id UUID REFERENCES couriers(id),
    pickup_address_id UUID REFERENCES addresses(id),
    delivery_address_id UUID REFERENCES addresses(id),
    assigned_courier_runner UUID REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    weight_kg DECIMAL(6,2) NOT NULL,
    dimensions VARCHAR(50),
    description TEXT,
    is_fragile BOOLEAN DEFAULT FALSE,
    declared_value DECIMAL(10,2) DEFAULT 0.00,
    price DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'payment_pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled')),
    tracking_number VARCHAR(100) UNIQUE,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    cancellation_reason TEXT
);

CREATE INDEX idx_deliveries_seller_id ON deliveries(seller_id);
CREATE INDEX idx_deliveries_courier_runner ON deliveries(assigned_courier_runner);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_payment_status ON deliveries(payment_status);
CREATE INDEX idx_deliveries_tracking ON deliveries(tracking_number);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at);
CREATE INDEX idx_deliveries_seller_status ON deliveries(seller_id, status);
CREATE INDEX idx_deliveries_runner_status ON deliveries(assigned_courier_runner, status);

-- Delivery status history (audit trail)
CREATE TABLE delivery_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    location TEXT,
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_status_history_delivery ON delivery_status_history(delivery_id);
CREATE INDEX idx_status_history_timestamp ON delivery_status_history(timestamp);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('payment', 'refund', 'deposit', 'payout')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(50),
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_delivery_id ON transactions(delivery_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);

-- Billing information
CREATE TABLE billing_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    total_refunds DECIMAL(10,2) DEFAULT 0.00,
    pending_payments DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal')),
    provider VARCHAR(50),
    provider_payment_method_id VARCHAR(255),
    card_brand VARCHAR(20),
    last4 VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    line_items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Courier earnings tracking
CREATE TABLE courier_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
    payout_date DATE,
    transaction_id UUID REFERENCES transactions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(delivery_id)
);

CREATE INDEX idx_earnings_courier ON courier_earnings(courier_id);
CREATE INDEX idx_earnings_status ON courier_earnings(status);

-- Support tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
    assigned_admin_id UUID REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'pending', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_priority ON support_tickets(priority);

-- Ticket messages/replies
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_messages ON ticket_messages(ticket_id);

-- API keys for users
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(255) UNIQUE NOT NULL,
    secret_encrypted TEXT NOT NULL,
    name VARCHAR(100),
    permissions JSONB,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_user ON user_api_keys(user_id);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    related_delivery_id UUID REFERENCES deliveries(id),
    related_ticket_id UUID REFERENCES support_tickets(id),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Audit log for admin actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- Monthly spending summary (for analytics)
CREATE TABLE monthly_spending (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    amount DECIMAL(10,2) DEFAULT 0.00,
    UNIQUE(user_id, year, month)
);

CREATE INDEX idx_monthly_user ON monthly_spending(user_id);

-- Login history for analytics
CREATE TABLE user_login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_login_history_user_id ON user_login_history(user_id);
CREATE INDEX idx_login_history_logged_in_at ON user_login_history(logged_in_at);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_delivery_updated_at
    BEFORE UPDATE ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();