import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";
import { CommonCard } from "@/components/shared/CommonCard";
import api from "@/services/api";

interface NotificationHistoryItem {
  id: string;
  status: string;
  notification_type: string;
  recipient_email: string;
  subject: string;
  property_name: string | null;
  tenant_name: string | null;
  sent_at: string;
}

export default function NotificationHistory() {
  const { token } = useAuth();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notification-history"],
    queryFn: async (): Promise<NotificationHistoryItem[]> => {
      const response = await api.get("/notifications");
      return response.data;
    },
    enabled: !!token,
  });

  const columns: ColumnConfig<NotificationHistoryItem>[] = [
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.status === "sent" ? (
            <CheckCircle className="h-4 w-4 text-success" />
          ) : item.status === "failed" ? (
            <XCircle className="h-4 w-4 text-destructive" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
          <Badge variant={item.status === "sent" ? "default" : item.status === "failed" ? "destructive" : "secondary"} 
                 className={item.status === "sent" ? "bg-success" : ""}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </div>
      )
    },
    { 
      key: "notification_type", 
      label: "Type", 
      sortable: true,
      render: (item) => {
        const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
          lease_renewal: { label: "Lease Renewal", variant: "default" },
          rent_reminder: { label: "Rent Reminder", variant: "secondary" },
          maintenance_update: { label: "Maintenance", variant: "outline" },
        };
        const config = typeMap[item.notification_type] || { label: item.notification_type, variant: "outline" as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      }
    },
    { key: "recipient_email", label: "Recipient", sortable: true, className: "font-mono text-sm" },
    { key: "subject", label: "Subject", sortable: true, className: "max-w-xs truncate" },
    { key: "property_name", label: "Property", sortable: true, render: (item) => item.property_name || "-" },
    { key: "tenant_name", label: "Tenant", sortable: true, render: (item) => item.tenant_name || "-" },
    { 
      key: "sent_at", 
      label: "Sent At", 
      sortable: true, 
      render: (item) => item.sent_at ? format(new Date(item.sent_at), "MMM dd, yyyy HH:mm") : "-"
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Notification History" 
        description="Track all sent email notifications with delivery status and timestamps" 
      />
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications?.filter((n) => n.status === "sent").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {notifications?.filter((n) => n.status === "sent").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {notifications?.filter((n) => n.status === "failed").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <CommonCard title="Email Notifications">
          <CommonTable<NotificationHistoryItem>
            data={notifications}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Search by recipient or subject..."
            searchKeys={["recipient_email", "subject"]}
            emptyMessage="No notifications sent yet"
          />
        </CommonCard>
      </div>
    </DashboardLayout>
  );
}
