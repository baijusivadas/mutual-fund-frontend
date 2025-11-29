-- Create Purchase View (Purchase, SIP, Switch-In transactions)
CREATE OR REPLACE VIEW public.purchases AS
SELECT 
  id,
  investment_date as date,
  scheme_name as scheme,
  units,
  nav,
  value as amount,
  folio_number as folio,
  investor_name,
  transaction_type,
  created_at
FROM public.transactions
WHERE 
  transaction_type ILIKE '%purchase%' 
  OR transaction_type ILIKE '%systematic%'
  OR transaction_type ILIKE '%switch%in%'
  OR (units > 0 AND transaction_type NOT ILIKE '%redeem%');

-- Create Redemption View (Redemption, Switch-Out transactions)
CREATE OR REPLACE VIEW public.redemptions AS
SELECT 
  id,
  investment_date as date,
  scheme_name as scheme,
  units,
  nav,
  value as amount,
  folio_number as folio,
  investor_name,
  transaction_type,
  created_at
FROM public.transactions
WHERE 
  transaction_type ILIKE '%redeem%'
  OR transaction_type ILIKE '%switch%out%'
  OR units < 0;

-- Create Scheme Summary View
CREATE OR REPLACE VIEW public.scheme_summary AS
SELECT 
  scheme_name,
  SUM(CASE 
    WHEN transaction_type ILIKE '%purchase%' 
      OR transaction_type ILIKE '%systematic%'
      OR (units > 0 AND transaction_type NOT ILIKE '%redeem%')
    THEN value ELSE 0 
  END) as total_purchased,
  SUM(CASE 
    WHEN transaction_type ILIKE '%redeem%' 
      OR transaction_type ILIKE '%switch%out%'
      OR units < 0
    THEN ABS(value) ELSE 0 
  END) as total_redeemed,
  SUM(CASE 
    WHEN transaction_type ILIKE '%purchase%' 
      OR transaction_type ILIKE '%systematic%'
      OR (units > 0 AND transaction_type NOT ILIKE '%redeem%')
    THEN value 
    WHEN transaction_type ILIKE '%redeem%' 
      OR transaction_type ILIKE '%switch%out%'
      OR units < 0
    THEN -ABS(value)
    ELSE 0 
  END) as net_investment,
  SUM(units) as current_units,
  MAX(nav) as latest_nav,
  SUM(units) * MAX(nav) as net_value,
  COUNT(DISTINCT investor_name) as total_investors
FROM public.transactions
GROUP BY scheme_name;

-- Create Folio Summary View
CREATE OR REPLACE VIEW public.folio_summary AS
SELECT 
  folio_number as folio_no,
  investor_name as investor,
  SUM(CASE 
    WHEN transaction_type ILIKE '%purchase%' 
      OR transaction_type ILIKE '%systematic%'
      OR (units > 0 AND transaction_type NOT ILIKE '%redeem%')
    THEN value ELSE 0 
  END) as total_investment,
  SUM(CASE 
    WHEN transaction_type ILIKE '%redeem%' 
      OR transaction_type ILIKE '%switch%out%'
      OR units < 0
    THEN ABS(value) ELSE 0 
  END) as total_redemption,
  SUM(CASE 
    WHEN transaction_type ILIKE '%purchase%' 
      OR transaction_type ILIKE '%systematic%'
      OR (units > 0 AND transaction_type NOT ILIKE '%redeem%')
    THEN value 
    WHEN transaction_type ILIKE '%redeem%' 
      OR transaction_type ILIKE '%switch%out%'
      OR units < 0
    THEN -ABS(value)
    ELSE 0 
  END) as net_gain_loss,
  SUM(units) as current_units,
  COUNT(*) as transaction_count,
  COUNT(DISTINCT scheme_name) as schemes_invested
FROM public.transactions
WHERE folio_number IS NOT NULL
GROUP BY folio_number, investor_name;