-- Guardianship App Database Schema
-- Initial migration for customers, referrals, reps, and rep_customers tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reps table
CREATE TABLE reps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- For auth, will be handled by Supabase Auth
  role TEXT NOT NULL DEFAULT 'rep' CHECK (role IN ('rep', 'admin')),
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  referee_name TEXT NOT NULL,
  referee_phone TEXT,
  referee_email TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'contacted', 'quoted', 'sold')),
  value INTEGER DEFAULT 250,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rep-Customer junction table (many-to-many)
CREATE TABLE rep_customers (
  rep_id UUID NOT NULL REFERENCES reps(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (rep_id, customer_id)
);

-- Indexes for performance
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_created_at ON referrals(created_at DESC);
CREATE INDEX idx_rep_customers_rep_id ON rep_customers(rep_id);
CREATE INDEX idx_rep_customers_customer_id ON rep_customers(customer_id);
CREATE INDEX idx_reps_email ON reps(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for referrals updated_at
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies (to be enabled when Supabase is connected)
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rep_customers ENABLE ROW LEVEL SECURITY;
