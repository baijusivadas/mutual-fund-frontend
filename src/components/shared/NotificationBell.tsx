import { useState, useMemo } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAdvancedPortfolio } from "@/hooks/useAdvancedPortfolio";

export function NotificationBell() {
    const { liabilities } = useAdvancedPortfolio();
    const [open, setOpen] = useState(false);

    const notifications = useMemo(() => {
        const notifs: any[] = [];
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        // Check Liabilities for upcoming payments based on Start Date day-of-month recurrence
        liabilities.forEach((l: any) => {
            if (!l.start_date || !l.monthly_emi) return;

            const startDate = new Date(l.start_date);
            const paymentDay = startDate.getDate();

            // Calculate next payment date
            let nextPayment = new Date(today.getFullYear(), today.getMonth(), paymentDay);

            // If payment day has passed this month, push it to next month
            if (today.getDate() > paymentDay) {
                nextPayment.setMonth(nextPayment.getMonth() + 1);
            }

            // If the next payment is within 7 days
            if (nextPayment >= today && nextPayment <= nextWeek) {
                const isToday = nextPayment.toDateString() === today.toDateString();
                const daysLeft = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 3600 * 24));

                notifs.push({
                    type: "EMI",
                    title: `${l.loan_type.toUpperCase()} EMI Due`,
                    message: `₹${parseFloat(l.monthly_emi).toLocaleString("en-IN")} due ${isToday ? "Today!" : `in ${daysLeft} days`}`,
                    date: nextPayment.toLocaleDateString(),
                    urgent: daysLeft <= 2
                });
            }
        });

        // Add additional logic here for Mutual Fund SIPs if schema has day data
        // ...

        return notifs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [liabilities]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                            {notifications.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
                <div className="flex items-center justify-between pb-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {notifications.length > 0 && (
                        <span className="text-xs bg-muted px-2 rounded-xl text-muted-foreground">{notifications.length} Pending</span>
                    )}
                </div>

                <div className="mt-4 space-y-3">
                    {notifications.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground pb-2">No upcoming payments this week.</p>
                    ) : (
                        notifications.map((n, i) => (
                            <div key={i} className={`flex flex-col gap-1 p-3 rounded-lg border ${n.urgent ? 'bg-destructive/10 border-destructive/20' : 'bg-muted/50'}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`text-xs font-semibold ${n.urgent ? 'text-destructive' : 'text-primary'}`}>{n.title}</span>
                                    <span className="text-xs opacity-70">{n.date}</span>
                                </div>
                                <p className="text-sm">{n.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
