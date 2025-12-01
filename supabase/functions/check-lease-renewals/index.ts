import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for lease renewals and rent reminders...");

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Check for expiring leases (30 days notice)
    const { data: expiringLeases, error: leasesError } = await supabase
      .from("rental_properties")
      .select("*")
      .gte("lease_end_date", today.toISOString())
      .lte("lease_end_date", thirtyDaysFromNow.toISOString())
      .eq("status", "occupied");

    if (leasesError) {
      console.error("Error fetching expiring leases:", leasesError);
      throw leasesError;
    }

    console.log(`Found ${expiringLeases?.length || 0} expiring leases`);

    // Send lease renewal notifications
    const leaseNotifications = [];
    for (const property of expiringLeases || []) {
      if (property.tenant_name) {
        const emailPayload = {
          to: "admin@example.com", // Replace with actual tenant email
          subject: `Lease Renewal Notice - ${property.property_name}`,
          type: "lease_renewal",
          propertyName: property.property_name,
          tenantName: property.tenant_name,
          expirationDate: new Date(property.lease_end_date).toLocaleDateString(),
        };

        const response = await supabase.functions.invoke("send-notification-email", {
          body: emailPayload,
        });

        leaseNotifications.push({
          property: property.property_name,
          tenant: property.tenant_name,
          status: response.error ? "failed" : "sent",
        });

        console.log(`Lease renewal email for ${property.property_name}:`, response.error || "sent");
      }
    }

    // Check for rent reminders (properties occupied, send on 1st of month)
    let rentReminders = [];
    if (today.getDate() === 1) {
      const { data: occupiedProperties, error: rentError } = await supabase
        .from("rental_properties")
        .select("*")
        .eq("status", "occupied");

      if (rentError) {
        console.error("Error fetching occupied properties:", rentError);
        throw rentError;
      }

      console.log(`Found ${occupiedProperties?.length || 0} properties for rent reminders`);

      for (const property of occupiedProperties || []) {
        if (property.tenant_name && property.monthly_rent) {
          const emailPayload = {
            to: "admin@example.com", // Replace with actual tenant email
            subject: `Rent Payment Reminder - ${property.property_name}`,
            type: "rent_reminder",
            propertyName: property.property_name,
            tenantName: property.tenant_name,
            rentAmount: property.monthly_rent,
          };

          const response = await supabase.functions.invoke("send-notification-email", {
            body: emailPayload,
          });

          rentReminders.push({
            property: property.property_name,
            tenant: property.tenant_name,
            amount: property.monthly_rent,
            status: response.error ? "failed" : "sent",
          });

          console.log(`Rent reminder for ${property.property_name}:`, response.error || "sent");
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        leaseNotifications,
        rentReminders,
        summary: {
          expiringLeases: expiringLeases?.length || 0,
          leaseEmailsSent: leaseNotifications.length,
          rentRemindersSent: rentReminders.length,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-lease-renewals function:", error);
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
