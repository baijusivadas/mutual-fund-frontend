-- Create Real Estate table
CREATE TABLE public.real_estate (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_name TEXT NOT NULL,
  location TEXT NOT NULL,
  price NUMERIC NOT NULL,
  area NUMERIC NOT NULL,
  property_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  description TEXT,
  images TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Gold table
CREATE TABLE public.gold (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  purity TEXT NOT NULL,
  price NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_stock',
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Flats table
CREATE TABLE public.flats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flat_name TEXT NOT NULL,
  location TEXT NOT NULL,
  price NUMERIC NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area NUMERIC NOT NULL,
  floor INTEGER,
  status TEXT NOT NULL DEFAULT 'available',
  description TEXT,
  images TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Rental Properties table
CREATE TABLE public.rental_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_name TEXT NOT NULL,
  location TEXT NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  deposit NUMERIC NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  description TEXT,
  images TEXT[],
  tenant_name TEXT,
  lease_start_date DATE,
  lease_end_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.real_estate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_properties ENABLE ROW LEVEL SECURITY;

-- SuperAdmins can manage all real estate
CREATE POLICY "SuperAdmins can manage all real estate"
ON public.real_estate
FOR ALL
USING (has_role(auth.uid(), 'superAdmin'::app_role));

-- SuperAdmins can manage all gold
CREATE POLICY "SuperAdmins can manage all gold"
ON public.gold
FOR ALL
USING (has_role(auth.uid(), 'superAdmin'::app_role));

-- SuperAdmins can manage all flats
CREATE POLICY "SuperAdmins can manage all flats"
ON public.flats
FOR ALL
USING (has_role(auth.uid(), 'superAdmin'::app_role));

-- SuperAdmins can manage all rental properties
CREATE POLICY "SuperAdmins can manage all rental properties"
ON public.rental_properties
FOR ALL
USING (has_role(auth.uid(), 'superAdmin'::app_role));

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_real_estate_updated_at
BEFORE UPDATE ON public.real_estate
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gold_updated_at
BEFORE UPDATE ON public.gold
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flats_updated_at
BEFORE UPDATE ON public.flats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rental_properties_updated_at
BEFORE UPDATE ON public.rental_properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_real_estate_status ON public.real_estate(status);
CREATE INDEX idx_real_estate_created_at ON public.real_estate(created_at DESC);

CREATE INDEX idx_gold_status ON public.gold(status);
CREATE INDEX idx_gold_purchase_date ON public.gold(purchase_date DESC);

CREATE INDEX idx_flats_status ON public.flats(status);
CREATE INDEX idx_flats_created_at ON public.flats(created_at DESC);

CREATE INDEX idx_rental_properties_status ON public.rental_properties(status);
CREATE INDEX idx_rental_properties_lease_dates ON public.rental_properties(lease_start_date, lease_end_date);