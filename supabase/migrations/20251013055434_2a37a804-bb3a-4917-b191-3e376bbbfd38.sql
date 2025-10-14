-- Drop existing views
DROP VIEW IF EXISTS public.purchases CASCADE;
DROP VIEW IF EXISTS public.redemptions CASCADE;
DROP VIEW IF EXISTS public.scheme_summary CASCADE;
DROP VIEW IF EXISTS public.folio_summary CASCADE;

-- Drop old transactions table
DROP TABLE IF EXISTS public.transactions CASCADE;

-- 1. Raw Transaction Table
CREATE TABLE public.raw_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  scheme_name TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  units NUMERIC NOT NULL,
  nav NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  folio_no TEXT,
  investor_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.raw_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for raw_transactions
CREATE POLICY "Allow public read access to raw_transactions"
ON public.raw_transactions FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert raw_transactions"
ON public.raw_transactions FOR INSERT
WITH CHECK (true);

-- 2. Purchase Table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  scheme TEXT NOT NULL,
  units NUMERIC NOT NULL,
  nav NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  folio TEXT,
  investor_name TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchases
CREATE POLICY "Allow public read access to purchases"
ON public.purchases FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert purchases"
ON public.purchases FOR INSERT
WITH CHECK (true);

-- 3. Redemption Table
CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  scheme TEXT NOT NULL,
  units NUMERIC NOT NULL,
  nav NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  folio TEXT,
  investor_name TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for redemptions
CREATE POLICY "Allow public read access to redemptions"
ON public.redemptions FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert redemptions"
ON public.redemptions FOR INSERT
WITH CHECK (true);

-- 4. Scheme Summary Table
CREATE TABLE public.scheme_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name TEXT UNIQUE NOT NULL,
  total_purchased NUMERIC DEFAULT 0,
  total_redeemed NUMERIC DEFAULT 0,
  net_investment NUMERIC DEFAULT 0,
  current_units NUMERIC DEFAULT 0,
  net_value NUMERIC DEFAULT 0,
  latest_nav NUMERIC,
  total_investors INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheme_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheme_summary
CREATE POLICY "Allow public read access to scheme_summary"
ON public.scheme_summary FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to modify scheme_summary"
ON public.scheme_summary FOR ALL
USING (true)
WITH CHECK (true);

-- 5. Folio Summary Table
CREATE TABLE public.folio_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio_no TEXT NOT NULL,
  investor TEXT NOT NULL,
  total_investment NUMERIC DEFAULT 0,
  total_redemption NUMERIC DEFAULT 0,
  net_gain_loss NUMERIC DEFAULT 0,
  current_units NUMERIC DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  schemes_invested INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(folio_no, investor)
);

-- Enable RLS
ALTER TABLE public.folio_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for folio_summary
CREATE POLICY "Allow public read access to folio_summary"
ON public.folio_summary FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to modify folio_summary"
ON public.folio_summary FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_raw_transactions_investor ON public.raw_transactions(investor_name);
CREATE INDEX idx_raw_transactions_scheme ON public.raw_transactions(scheme_name);
CREATE INDEX idx_raw_transactions_date ON public.raw_transactions(date);
CREATE INDEX idx_purchases_investor ON public.purchases(investor_name);
CREATE INDEX idx_purchases_scheme ON public.purchases(scheme);
CREATE INDEX idx_redemptions_investor ON public.redemptions(investor_name);
CREATE INDEX idx_redemptions_scheme ON public.redemptions(scheme);