-- Create notification_history table to track sent emails
CREATE TABLE IF NOT EXISTS public.notification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  property_name text,
  tenant_name text,
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view notification history
CREATE POLICY "Authenticated users can view notification history"
ON public.notification_history
FOR SELECT
TO authenticated
USING (true);

-- Allow edge functions to insert notification history
CREATE POLICY "Service role can insert notification history"
ON public.notification_history
FOR INSERT
TO service_role
WITH CHECK (true);

-- SuperAdmins can manage all notification history
CREATE POLICY "SuperAdmins can manage all notification history"
ON public.notification_history
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superAdmin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_notification_history_sent_at ON public.notification_history(sent_at DESC);
CREATE INDEX idx_notification_history_status ON public.notification_history(status);