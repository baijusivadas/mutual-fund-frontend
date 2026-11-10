import { useState, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Calendar,
  Check,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAdvancedEntity } from "@/hooks/useAdvancedPortfolio";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type: "alert" | "transaction" | "reminder";
  title: string;
  message: string;
  timestamp: string;
  date: Date;
  read: boolean;
  urgent: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "alert",
    title: "Nifty 50 Index Milestone",
    message: "Nifty crossed 25,400 points (+1.12%). Check asset rebalancing thresholds.",
    timestamp: "10 mins ago",
    date: new Date(Date.now() - 10 * 60 * 1000),
    read: false,
    urgent: false,
    actionUrl: "/portfolio-analysis",
    actionLabel: "Analyze Mix",
  },
  {
    id: "notif-2",
    type: "transaction",
    title: "SIP Deduction Executed",
    message: "₹5,000 processed for HDFC Flexi Cap Fund. Folio: 987654/01.",
    timestamp: "2 hours ago",
    date: new Date(Date.now() - 2 * 3600 * 1000),
    read: false,
    urgent: false,
    actionUrl: "/transactions",
    actionLabel: "View Ledger",
  },
  {
    id: "notif-3",
    type: "reminder",
    title: "Client KYC Verification Required",
    message: "2 investor accounts require updated PAN/Aadhaar document verification.",
    timestamp: "1 day ago",
    date: new Date(Date.now() - 24 * 3600 * 1000),
    read: false,
    urgent: true,
    actionUrl: "/admin/investors",
    actionLabel: "Review KYC",
  },
];

export const NotificationCenter = memo(() => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "alert" | "transaction" | "reminder">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Dynamic liability EMI alerts
  const { data: liabilities = [] } = useAdvancedEntity<any>("liabilities");

  // Merge liabilities into reminders
  const combinedNotifications = useMemo(() => {
    const list = [...notifications];
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    liabilities.forEach((l) => {
      if (!l.start_date || !l.monthly_emi) return;
      const startDate = new Date(l.start_date);
      const paymentDay = startDate.getDate();
      const nextPayment = new Date(today.getFullYear(), today.getMonth(), paymentDay);

      if (today.getDate() > paymentDay) {
        nextPayment.setMonth(nextPayment.getMonth() + 1);
      }

      if (nextPayment >= today && nextPayment <= nextWeek) {
        const daysLeft = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 3600 * 24));
        const id = `emi-${l.id || l.liability_name}`;

        if (!list.some((n) => n.id === id)) {
          list.push({
            id,
            type: "reminder",
            title: `${(l.loan_type || "Loan").toUpperCase()} EMI Due`,
            message: `₹${Number(l.monthly_emi).toLocaleString("en-IN")} due in ${daysLeft} day(s).`,
            timestamp: `${daysLeft}d left`,
            date: nextPayment,
            read: false,
            urgent: daysLeft <= 2,
            actionUrl: "/liabilities",
            actionLabel: "Pay EMI",
          });
        }
      }
    });

    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [notifications, liabilities]);

  const filtered = useMemo(() => {
    if (filter === "all") return combinedNotifications;
    return combinedNotifications.filter((n) => n.type === filter);
  }, [combinedNotifications, filter]);

  const unreadCount = useMemo(
    () => combinedNotifications.filter((n) => !n.read).length,
    [combinedNotifications]
  );

  const hasUrgent = useMemo(
    () => combinedNotifications.some((n) => n.urgent && !n.read),
    [combinedNotifications]
  );

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markItemAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl hover:bg-muted/80 text-foreground transition-transform active:scale-95"
          title="Notification Center"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs",
                hasUrgent ? "bg-rose-600 animate-pulse" : "bg-blue-600"
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[400px] p-0 rounded-2xl border border-border/80 shadow-2xl bg-card overflow-hidden"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm text-foreground">
                Notifications
              </span>
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-bold px-1.5 py-0 bg-blue-500/15 text-blue-600 dark:text-blue-400 border-none"
                >
                  {unreadCount} new
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline px-2 py-0.5"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 pt-2.5 overflow-x-auto scrollbar-none">
            {(["all", "alert", "transaction", "reminder"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-2.5 py-0.5 rounded-lg text-[11px] font-semibold capitalize transition-all shrink-0",
                  filter === t
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications list */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/30 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-muted-foreground space-y-1">
              <CheckCircle2 className="h-8 w-8 text-emerald-500/60 mx-auto mb-2" />
              <p className="font-semibold text-foreground">All caught up!</p>
              <p className="text-[11px] text-muted-foreground/70">
                No active notifications under this filter.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const Icon =
                item.type === "alert"
                  ? AlertTriangle
                  : item.type === "transaction"
                  ? Receipt
                  : Calendar;

              const iconBg =
                item.urgent
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : item.type === "transaction"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : item.type === "alert"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400";

              return (
                <div
                  key={item.id}
                  className={cn(
                    "p-3.5 flex items-start gap-3 transition-colors hover:bg-muted/40",
                    !item.read && "bg-blue-50/40 dark:bg-blue-950/20"
                  )}
                >
                  <div
                    className={cn(
                      "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      iconBg
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      {item.actionUrl ? (
                        <Link
                          to={item.actionUrl}
                          onClick={() => {
                            markItemAsRead(item.id);
                            setOpen(false);
                          }}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{item.actionLabel || "View Details"}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      ) : (
                        <span />
                      )}

                      {!item.read && (
                        <button
                          onClick={() => markItemAsRead(item.id)}
                          className="text-muted-foreground hover:text-foreground text-[10px] inline-flex items-center gap-0.5"
                          title="Mark read"
                        >
                          <Check className="h-3 w-3" />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border/50 bg-muted/20 text-center">
          <Link
            to="/admin/notifications"
            onClick={() => setOpen(false)}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Notification & Audit History →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
});

NotificationCenter.displayName = "NotificationCenter";

