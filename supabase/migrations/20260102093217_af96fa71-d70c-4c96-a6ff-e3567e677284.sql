-- Create user_investment_mapping table to link investments to users
CREATE TABLE public.user_investment_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  asset_id UUID,
  investor_name TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_investment_mapping ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "SuperAdmins can manage all investment mappings"
ON public.user_investment_mapping
FOR ALL
USING (has_role(auth.uid(), 'superAdmin'::app_role));

CREATE POLICY "Users can view their own investment mappings"
ON public.user_investment_mapping
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_investment_mapping_updated_at
BEFORE UPDATE ON public.user_investment_mapping
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_investment_mapping_user_id ON public.user_investment_mapping(user_id);
CREATE INDEX idx_user_investment_mapping_asset_type ON public.user_investment_mapping(asset_type);
CREATE INDEX idx_user_investment_mapping_investor_name ON public.user_investment_mapping(investor_name);