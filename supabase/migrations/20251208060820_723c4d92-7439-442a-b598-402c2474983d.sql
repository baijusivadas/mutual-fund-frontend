-- Create cars table
CREATE TABLE public.cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  purchase_price NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  registration_number TEXT,
  purchase_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'owned',
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create liabilities table
CREATE TABLE public.liabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  liability_name TEXT NOT NULL,
  liability_type TEXT NOT NULL,
  principal_amount NUMERIC NOT NULL,
  outstanding_amount NUMERIC NOT NULL,
  interest_rate NUMERIC,
  monthly_payment NUMERIC,
  start_date DATE,
  end_date DATE,
  lender TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

-- RLS policies for cars
CREATE POLICY "SuperAdmins can manage all cars"
ON public.cars
FOR ALL
USING (has_role(auth.uid(), 'superAdmin'::app_role));

-- RLS policies for liabilities
CREATE POLICY "SuperAdmins can manage all liabilities"
ON public.liabilities
FOR ALL
USING (has_role(auth.uid(), 'superAdmin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_cars_updated_at
BEFORE UPDATE ON public.cars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_liabilities_updated_at
BEFORE UPDATE ON public.liabilities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();