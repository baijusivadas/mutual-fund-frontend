-- Create transactions table to store mutual fund transaction data
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type TEXT NOT NULL,
  investor_name TEXT NOT NULL,
  investment_date DATE NOT NULL,
  scheme_name TEXT NOT NULL,
  units DECIMAL(20, 4),
  nav DECIMAL(20, 4),
  value DECIMAL(20, 4),
  folio_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_transactions_investor ON public.transactions(investor_name);
CREATE INDEX idx_transactions_date ON public.transactions(investment_date);
CREATE INDEX idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX idx_transactions_scheme ON public.transactions(scheme_name);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read transactions
CREATE POLICY "Allow public read access to transactions" 
ON public.transactions 
FOR SELECT 
USING (true);

-- Create policy to allow authenticated users to insert transactions
CREATE POLICY "Allow authenticated users to insert transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);