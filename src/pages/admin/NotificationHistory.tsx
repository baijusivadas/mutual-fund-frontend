import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";
import { CommonCard } from "@/components/shared/CommonCard";
import { MetricCard } from "@/components/shared/MetricCard";
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

const SEARCH_KEYS: (keyof NotificationHistoryItem)[] = ["recipient_email", "subject"];

function NotificationHistory() {
  const { token } = useAuth();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notification-history"],
    queryFn: async (): Promise<NotificationHistoryItem[]> => {
      const response = await api.get("/notifications");
      return response.data?.data || response.data || [];
    },
    enabled: !!token,
  });

  const { totalSent, successful, failed } = useMemo(() => {
    let s = 0;
    let f = 0;
    for (const n of notifications) {
      if (n.status === "sent") s++;
      else if (n.status === "failed") f++;
    }
    return {
      totalSent: notifications.length,
      successful: s,
      failed: f,
    };
  }, [notifications]);

  const columns: ColumnConfig<NotificationHistoryItem>[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (item) => (
          <div className="flex items-center gap-1.5">
            {item.status === "sent" ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : item.status === "failed" ? (
              <XCircle className="h-4 w-4 text-rose-500" />
            ) : (
              <Clock className="h-4 w-4 text-muted-foreground" />
            )}
            <Badge
              variant="secondary"
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                item.status === "sent"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : item.status === "failed"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {item.status}
            </Badge>
          </div>
        ),
      },
      {
        key: "notification_type",
        label: "Type",
        sortable: true,
        render: (item) => (
          <Badge variant="outline" className="text-[10px] font-medium capitalize">
            {item.notification_type.replace(/_/g, " ")}
          </Badge>
        ),
      },
      { key: "recipient_email", label: "Recipient", sortable: true, className: "font-mono text-xs" },
      { key: "subject", label: "Subject", sortable: true, className: "font-semibold text-foreground" },
      {
        key: "property_name",
        label: "Related Property",
        sortable: true,
        render: (item) => item.property_name || <span className="text-muted-foreground">-</span>,
      },
      {
        key: "sent_at",
        label: "Sent At",
        sortable: true,
        render: (item) => (item.sent_at ? format(new Date(item.sent_at), "MMM dd, yyyy HH:mm") : "-"),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Notification History"
        description="Audit log of all outbound emails, tenant alerts, and system notifications"
      />
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <MetricCard
            title="Total Dispatched"
            value={totalSent}
            change="All Email Transmissions"
            changeType="neutral"
            icon={Mail}
          />
          <MetricCard
            title="Delivered Successfully"
            value={successful}
            change={`${totalSent > 0 ? ((successful / totalSent) * 100).toFixed(0) : 0}% Delivery Rate`}
            changeType="positive"
            icon={CheckCircle}
          />
          <MetricCard
            title="Failed Deliveries"
            value={failed}
            change="SMTP / Address Failures"
            changeType={failed > 0 ? "negative" : "neutral"}
            icon={XCircle}
          />
        </div>

        <CommonCard
          title="Email Notification Ledger"
          className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl"
        >
          <CommonTable<NotificationHistoryItem>
            data={notifications}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Search by recipient or subject..."
            searchKeys={SEARCH_KEYS}
            emptyMessage="No notifications recorded in history"
          />
        </CommonCard>
      </div>
    </div>
  );
}

export default memo(NotificationHistory);
