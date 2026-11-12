import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, CheckCircle2, XCircle, Clock, Send, ShieldAlert, Sparkles, Filter, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";
import { CommonCard } from "@/components/shared/CommonCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { Sparkline } from "@/components/charts/Sparkline";
import { cn } from "@/lib/utils";

/* ── KPI Metric Card ─────────────────────────────────────────── */
interface ModernNotifKpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  tag?: string;
  isPositive?: boolean;
  sparkData: number[];
  sparkColor: string;
  icon: React.ReactNode;
}

const ModernNotifKpiCard = memo(
  ({ title, value, subValue, tag, isPositive = true, sparkData, sparkColor, icon }: ModernNotifKpiCardProps) => (
    <Card className="relative overflow-hidden bg-card border border-border/80 rounded-2xl shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200 group flex flex-col justify-between">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{title}</span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              {icon}
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-2.5 gap-2">
            <div>
              <p className="text-2xl font-heading font-extrabold text-foreground tracking-tight">{value}</p>
              {subValue && (
                <p className={cn("text-xs font-bold mt-0.5", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                  {subValue}
                </p>
              )}
            </div>
            <div className="w-[95px] shrink-0">
              <Sparkline data={sparkData} color={sparkColor} />
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Outbound Transmission</span>
          {tag && (
            <Badge
              variant="outline"
              className={cn("text-[9px] font-bold px-1.5 py-0 rounded border-none", isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}
            >
              {tag}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
);
ModernNotifKpiCard.displayName = "ModernNotifKpiCard";

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

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ["notification-history"],
    queryFn: async (): Promise<NotificationHistoryItem[]> => {
      const response = await api.get("/notifications");
      return response.data?.data || response.data || [];
    },
    enabled: !!token,
  });

  const { totalSent, successful, failed, deliveryRate } = useMemo(() => {
    let s = 0;
    let f = 0;
    for (const n of notifications) {
      if (n.status === "sent") s++;
      else if (n.status === "failed") f++;
    }
    const rate = notifications.length > 0 ? ((s / notifications.length) * 100).toFixed(1) : "100.0";
    return {
      totalSent: notifications.length,
      successful: s,
      failed: f,
      deliveryRate: rate,
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
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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
        label: "Category",
        sortable: true,
        render: (item) => (
          <Badge variant="outline" className="text-[10px] font-medium capitalize border-border/80">
            {item.notification_type.replace(/_/g, " ")}
          </Badge>
        ),
      },
      { key: "recipient_email", label: "Recipient", sortable: true, className: "font-mono text-xs text-foreground" },
      { key: "subject", label: "Subject", sortable: true, className: "font-semibold text-foreground" },
      {
        key: "property_name",
        label: "Folio / Context",
        sortable: true,
        render: (item) => item.property_name || <span className="text-muted-foreground">-</span>,
      },
      {
        key: "sent_at",
        label: "Dispatched At",
        sortable: true,
        render: (item) => (item.sent_at ? format(new Date(item.sent_at), "MMM dd, yyyy HH:mm") : "-"),
      },
    ],
    []
  );

  return (
    <div className="space-y-5 animate-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Mail className="h-4 w-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-heading font-extrabold text-foreground">
              Notification Audit Log
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Complete cryptographic audit trail of all outbound investor emails, EMI reminders, and system alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs font-bold rounded-xl border-border/80">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Feed
          </Button>
        </div>
      </div>

      {/* ── Top 3 Modern KPI Cards ── */}
      <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-3">
        <ModernNotifKpiCard
          title="Total Dispatched"
          value={totalSent.toString()}
          subValue="All Outbound Messages"
          sparkData={[totalSent * 0.7, totalSent * 0.85, totalSent * 0.95, totalSent]}
          sparkColor="#2563eb"
          icon={<Send className="h-4 w-4" />}
          tag="Transmissions"
        />

        <ModernNotifKpiCard
          title="Delivered Successfully"
          value={successful.toString()}
          subValue={`${deliveryRate}% Success Rate`}
          isPositive={true}
          sparkData={[successful * 0.8, successful * 0.9, successful]}
          sparkColor="#10b981"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tag="Delivered"
        />

        <ModernNotifKpiCard
          title="Failed Deliveries"
          value={failed.toString()}
          subValue={failed === 0 ? "Zero SMTP Failures" : "SMTP / Address Bounces"}
          isPositive={failed === 0}
          sparkData={[0, 0, failed]}
          sparkColor={failed === 0 ? "#10b981" : "#ef4444"}
          icon={<XCircle className="h-4 w-4" />}
          tag={failed === 0 ? "Healthy" : "Attention"}
        />
      </div>

      {/* ── Table Card ── */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border/50">
          <CardTitle className="text-sm font-bold text-foreground">
            Transmission Log ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <CommonTable<NotificationHistoryItem>
            data={notifications}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Search recipient email, subject, or folio..."
            searchKeys={SEARCH_KEYS}
            emptyMessage="No notification logs found in active tenant"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(NotificationHistory);
