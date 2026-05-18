-- Migration: Core Investment Schema
-- Created at: 2026-05-07 11:18:00

-- ==========================================
-- 1. System Master Tables
-- ==========================================

-- Countries
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  iso_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- States
CREATE TABLE IF NOT EXISTS public.states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  state_code TEXT NOT NULL,
  UNIQUE(country_id, state_code)
);

-- Currencies
CREATE TABLE IF NOT EXISTS public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  symbol TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. Mutual Fund Master Tables
-- ==========================================

-- Fund Houses (AMCs)
CREATE TABLE IF NOT EXISTS public.fund_houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mutual Funds (Schemes)
CREATE TABLE IF NOT EXISTS public.mutual_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_house_id UUID REFERENCES public.fund_houses(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  scheme_type TEXT, -- e.g., Equity, Debt, Hybrid
  category TEXT,    -- e.g., Large Cap, Mid Cap, Sectoral
  isin TEXT UNIQUE,
  amfi_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NAV History
CREATE TABLE IF NOT EXISTS public.nav_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mutual_fund_id UUID REFERENCES public.mutual_funds(id) ON DELETE CASCADE,
  nav NUMERIC NOT NULL,
  nav_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mutual_fund_id, nav_date)
);

-- ==========================================
-- 3. Investor Management Tables
-- ==========================================

-- Investors
CREATE TABLE IF NOT EXISTS public.investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  pan TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investor Bank Accounts
CREATE TABLE IF NOT EXISTS public.investor_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  account_type TEXT, -- Savings, Current
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investor KYC
CREATE TABLE IF NOT EXISTS public.investor_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE,
  kyc_status TEXT NOT NULL DEFAULT 'Pending', -- Verified, Pending, Rejected, Not Started
  verified_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(investor_id)
);

-- ==========================================
-- 4. Enable RLS and Policies
-- ==========================================

-- Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fund_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutual_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_kyc ENABLE ROW LEVEL SECURITY;

-- Public read access for Master Tables
CREATE POLICY "Public read access for countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public read access for states" ON public.states FOR SELECT USING (true);
CREATE POLICY "Public read access for currencies" ON public.currencies FOR SELECT USING (true);
CREATE POLICY "Public read access for fund_houses" ON public.fund_houses FOR SELECT USING (true);
CREATE POLICY "Public read access for mutual_funds" ON public.mutual_funds FOR SELECT USING (true);
CREATE POLICY "Public read access for nav_history" ON public.nav_history FOR SELECT USING (true);

-- Investor specific policies (Users can only see their own investors)
CREATE POLICY "Users can view their own investors" 
  ON public.investors FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'superAdmin'));

CREATE POLICY "Users can insert their own investors" 
  ON public.investors FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'superAdmin'));

CREATE POLICY "Users can update their own investors" 
  ON public.investors FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'superAdmin'));

-- Bank accounts (Linked to investors)
CREATE POLICY "Users can view their investor bank accounts" 
  ON public.investor_bank_accounts FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.investors 
    WHERE id = investor_id AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'superAdmin'))
  ));

-- KYC (Linked to investors)
CREATE POLICY "Users can view their investor kyc" 
  ON public.investor_kyc FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.investors 
    WHERE id = investor_id AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'superAdmin'))
  ));

-- ==========================================
-- 5. Indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_states_country_id ON public.states(country_id);
CREATE INDEX IF NOT EXISTS idx_mutual_funds_fund_house_id ON public.mutual_funds(fund_house_id);
CREATE INDEX IF NOT EXISTS idx_nav_history_mutual_fund_id ON public.nav_history(mutual_fund_id);
CREATE INDEX IF NOT EXISTS idx_nav_history_date ON public.nav_history(nav_date);
CREATE INDEX IF NOT EXISTS idx_investors_user_id ON public.investors(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_bank_accounts_investor_id ON public.investor_bank_accounts(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_kyc_investor_id ON public.investor_kyc(investor_id);

-- ==========================================
-- 6. Triggers for updated_at
-- ==========================================

CREATE TRIGGER update_fund_houses_updated_at BEFORE UPDATE ON public.fund_houses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mutual_funds_updated_at BEFORE UPDATE ON public.mutual_funds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON public.investors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investor_bank_accounts_updated_at BEFORE UPDATE ON public.investor_bank_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investor_kyc_updated_at BEFORE UPDATE ON public.investor_kyc
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
