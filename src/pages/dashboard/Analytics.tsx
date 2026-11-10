import { useEffect, useRef, useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Home,
  Users,
  Calendar,
  Loader2,
  Activity,
  PieChart as PieIcon,
  Building,
  KeyRound,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChartInsight } from "@/components/charts/ChartInsight";
import { usePropertyMetrics } from "@/hooks/usePropertyMetrics";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import { formatIndianUnits } from "@/utils/format";
import type { Flat, RealEstateProperty, RentalProperty } from "@/types";
import { cn } from "@/lib/utils";

interface PropertyMetricsResponse {
  details?: {
    rentalProperties?: RentalProperty[];
    flats?: Flat[];
    realEstate?: RealEstateProperty[];
  };
}

const SPARKLINE_HEIGHT = 44;

/* ── Smooth Sparkline ────────────────────────────────────────── */
const Sparkline = memo(({ data, color = "#2563eb" }: { data: number[]; color?: string }) => {
  const chartData = useMemo(() => {
    const safe = data && data.length > 0 ? data : [10, 15, 20, 25, 30];
    return safe.map((v, i) => ({ i, v }));
  }, [data]);

  const gradId = `ana-spk-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={SPARKLINE_HEIGHT}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} fill={`url(#${gradId})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
});
Sparkline.displayName = "Sparkline";

/* ── KPI Metric Card ─────────────────────────────────────────── */
interface ModernAnalyticsKpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  tag?: string;
  isPositive?: boolean;
  sparkData: number[];
  sparkColor: string;
  icon: React.ReactNode;
}

const ModernAnalyticsKpiCard = memo(
  ({ title, value, subValue, tag, isPositive = true, sparkData, sparkColor, icon }: ModernAnalyticsKpiCardProps) => (
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
          <span>Asset Analytics</span>
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
ModernAnalyticsKpiCard.displayName = "ModernAnalyticsKpiCard";

const CHART_PIE_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

const PROPERTY_CATEGORY_COUNT = 3;

export default function Analytics() {
  const { token } = useAuth();

  const { data, isLoading } = useQuery<PropertyMetricsResponse>({
    queryKey: ["portfolio-metrics"],
    queryFn: async () => {
      const response = await api.get("/analytics/metrics");
      return response.data;
    },
    enabled: !!token,
  });

  const rentalProperties = useMemo(() => data?.details?.rentalProperties || [], [data]);
  const flats = useMemo(() => data?.details?.flats || [], [data]);
  const realEstate = useMemo(() => data?.details?.realEstate || [], [data]);

  const metrics = usePropertyMetrics(rentalProperties, flats, realEstate);
  const occupiedCount = rentalProperties.filter((p) => p.status === "occupied").length;

  const topRentalIncome = metrics.rentalRevenueData[0];
  const rentalIncomeInsight = topRentalIncome
    ? `${topRentalIncome.property} contributes the highest monthly rent (${formatIndianUnits(topRentalIncome.revenue)}), ${((topRentalIncome.revenue / (metrics.totalMonthlyRevenue || 1)) * 100).toFixed(1)}% of current rental income.`
    : "No occupied rental properties have recorded monthly rent.";

  const topStatus = [...metrics.statusDistribution].sort((a, b) => b.value - a.value)[0];
  const statusInsight = topStatus
    ? `${topStatus.name} is the most common property status (${topStatus.value} of ${metrics.totalProperties} properties).`
    : "Add property records to see a status breakdown.";

  const topPropertyType = [...metrics.propertyTypeData]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)[0];
  const propertyTypeInsight = topPropertyType
    ? `${topPropertyType.name} make up the largest category, with ${topPropertyType.value} of ${metrics.totalProperties} properties.`
    : "Add property records to see a category breakdown.";

  const shownLeaseIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    metrics.expiringLeases.forEach((property) => {
      if (shownLeaseIds.current.has(property.id)) return;
      shownLeaseIds.current.add(property.id);
      toast.warning("Lease Expiring Soon", {
        description: `Lease for ${property.name} expires in ${property.daysUntilExpiration} days.`,
      });
    });
  }, [metrics.expiringLeases]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Activity className="h-4 w-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-heading font-extrabold text-foreground">
              Real Estate & Asset Analytics
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rental yields, occupancy performance, lease maturity monitoring, and capital valuations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-muted/40">
            {metrics.totalProperties} Properties Registered
          </Badge>
        </div>
      </div>

      {/* ── Top 4 Modern KPI Cards ── */}
      <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <ModernAnalyticsKpiCard
          title="Occupancy Rate"
          value={`${metrics.occupancyRate.toFixed(1)}%`}
          subValue={`${occupiedCount} of ${rentalProperties.length} rentals occupied`}
          isPositive={metrics.occupancyRate >= 70}
          sparkData={[metrics.occupancyRate * 0.9, metrics.occupancyRate * 0.95, metrics.occupancyRate]}
          sparkColor="#2563eb"
          icon={<Activity className="h-4 w-4" />}
          tag="Tenancy"
        />

        <ModernAnalyticsKpiCard
          title="Monthly Rental Income"
          value={formatIndianUnits(metrics.totalMonthlyRevenue)}
          subValue="Gross Inflow / Month"
          sparkData={[metrics.totalMonthlyRevenue * 0.9, metrics.totalMonthlyRevenue * 0.95, metrics.totalMonthlyRevenue]}
          sparkColor="#10b981"
          icon={<DollarSign className="h-4 w-4" />}
          tag="Monthly Cashflow"
        />

        <ModernAnalyticsKpiCard
          title="Total Properties"
          value={metrics.totalProperties.toString()}
          subValue={`${PROPERTY_CATEGORY_COUNT} Categories Tracked`}
          sparkData={[1, 2, metrics.totalProperties]}
          sparkColor="#8b5cf6"
          icon={<Home className="h-4 w-4" />}
          tag="Units"
        />

        <ModernAnalyticsKpiCard
          title="Real Estate Valuation"
          value={formatIndianUnits(metrics.totalPropertyValue)}
          subValue="Consolidated Asset Worth"
          sparkData={[metrics.totalPropertyValue * 0.92, metrics.totalPropertyValue * 0.98, metrics.totalPropertyValue]}
          sparkColor="#f59e0b"
          icon={<TrendingUp className="h-4 w-4" />}
          tag="Valuation"
        />
      </div>

      {/* ── Analytics Charts ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Rental Income by Property */}
        <Card className="rounded-2xl border border-border/80 bg-card shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-bold text-foreground">Monthly Rental Income by Unit</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              Gross Monthly Rent
            </Badge>
          </div>

          <div className="pt-3 flex-1">
            {metrics.rentalRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={metrics.rentalRevenueData} layout="vertical" margin={{ left: 16, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatIndianUnits(v)} />
                  <YAxis
                    dataKey="property"
                    type="category"
                    width={110}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(value: number) => [formatIndianUnits(value), "Monthly Rent"]}
                  />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={16} name="Monthly Rent" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
                No occupied rental income recorded.
              </div>
            )}
          </div>
          <ChartInsight>{rentalIncomeInsight}</ChartInsight>
        </Card>

        {/* Property Status Distribution */}
        <Card className="rounded-2xl border border-border/80 bg-card shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-sm font-bold text-foreground">Property Tenancy Status</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              Status Breakdown
            </Badge>
          </div>

          <div className="pt-3 flex-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={metrics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {metrics.statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_PIE_COLORS[index % CHART_PIE_COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ChartInsight>{statusInsight}</ChartInsight>
        </Card>

        {/* Property Category Distribution */}
        <Card className="rounded-2xl border border-border/80 bg-card shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm font-bold text-foreground">Asset Class Breakdown</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              Property Categories
            </Badge>
          </div>

          <div className="pt-3 flex-1">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={metrics.propertyTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} name="Units" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ChartInsight>{propertyTypeInsight}</ChartInsight>
        </Card>

        {/* Lease Expiration Monitoring */}
        <Card className="rounded-2xl border border-border/80 bg-card shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-sm font-bold text-foreground">Upcoming Lease Expirations</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              {metrics.expiringLeases.length} Expiring Soon
            </Badge>
          </div>

          <div className="pt-3 flex-1 space-y-2 max-h-[260px] overflow-y-auto scrollbar-thin">
            {metrics.expiringLeases.length > 0 ? (
              metrics.expiringLeases.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs"
                >
                  <div>
                    <p className="font-bold text-foreground">{property.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Expires: {new Date(property.leaseEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border-none",
                      property.daysUntilExpiration <= 30
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {property.daysUntilExpiration} days left
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">
                No leases expiring within the next 90 days.
              </div>
            )}
          </div>
          <div className="pt-2 text-[10px] text-muted-foreground text-right border-t border-border/30">
            Automated tenancy alert system active.
          </div>
        </Card>
      </div>
    </div>
  );
}
