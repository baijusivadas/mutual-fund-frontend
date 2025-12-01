import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  to: string;
  subject: string;
  type: "lease_renewal" | "rent_reminder" | "maintenance_update";
  propertyName: string;
  tenantName?: string;
  expirationDate?: string;
  rentAmount?: number;
  maintenanceDetails?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, propertyName, tenantName, expirationDate, rentAmount, maintenanceDetails }: EmailNotificationRequest = await req.json();

    let htmlContent = "";

    switch (type) {
      case "lease_renewal":
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Lease Renewal Notice</h1>
            <p>Dear ${tenantName || "Tenant"},</p>
            <p>This is a reminder that your lease for <strong>${propertyName}</strong> is expiring on <strong>${expirationDate}</strong>.</p>
            <p>Please contact us to discuss lease renewal options.</p>
            <p>Best regards,<br>Property Management Team</p>
          </div>
        `;
        break;

      case "rent_reminder":
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Rent Payment Reminder</h1>
            <p>Dear ${tenantName || "Tenant"},</p>
            <p>This is a friendly reminder that your monthly rent of <strong>₹${rentAmount?.toLocaleString()}</strong> for <strong>${propertyName}</strong> is due.</p>
            <p>Please ensure timely payment to avoid any late fees.</p>
            <p>Thank you for your cooperation.</p>
            <p>Best regards,<br>Property Management Team</p>
          </div>
        `;
        break;

      case "maintenance_update":
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Maintenance Update</h1>
            <p>Dear ${tenantName || "Tenant"},</p>
            <p>We have an update regarding maintenance at <strong>${propertyName}</strong>:</p>
            <p style="background-color: #f3f4f6; padding: 15px; border-radius: 5px;">${maintenanceDetails}</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>Property Management Team</p>
          </div>
        `;
        break;

      default:
        throw new Error("Invalid notification type");
    }

    const emailResponse = await resend.emails.send({
      from: "Property Management <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log to notification history
    try {
      await supabase.from("notification_history").insert({
        notification_type: type,
        recipient_email: to,
        subject: subject,
        property_name: propertyName,
        tenant_name: tenantName,
        status: "sent",
      });
    } catch (logError) {
      console.error("Failed to log notification history:", logError);
      // Don't fail the request if logging fails
    }

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);

    // Log failed notification
    try {
      await supabase.from("notification_history").insert({
        notification_type: "unknown",
        recipient_email: "error@example.com",
        subject: "Failed Email",
        status: "failed",
        error_message: error.message,
      });
    } catch (logError) {
      console.error("Failed to log error notification:", logError);
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
