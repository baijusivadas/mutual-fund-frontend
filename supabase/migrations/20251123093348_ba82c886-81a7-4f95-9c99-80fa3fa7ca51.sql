-- Create audit_logs table to track superAdmin actions
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  performed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- SuperAdmins can view all audit logs
CREATE POLICY "SuperAdmins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'superAdmin'::app_role));

-- SuperAdmins can insert audit logs
CREATE POLICY "SuperAdmins can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'superAdmin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_audit_logs_performed_by ON public.audit_logs(performed_by);
CREATE INDEX idx_audit_logs_target_user_id ON public.audit_logs(target_user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);