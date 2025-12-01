import { supabase } from "@/integrations/supabase/client";

interface SendEmailNotificationParams {
  to: string;
  subject: string;
  type: "lease_renewal" | "rent_reminder" | "maintenance_update";
  propertyName: string;
  tenantName?: string;
  expirationDate?: string;
  rentAmount?: number;
  maintenanceDetails?: string;
}

export const sendEmailNotification = async (params: SendEmailNotificationParams) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-notification-email", {
      body: params,
    });

    if (error) {
      console.error("Error sending email notification:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
};
