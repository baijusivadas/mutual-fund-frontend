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
} from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChartCard, chartTooltipStyle } from "@/components/charts/ChartCard";
import { ChartInsight } from "@/components/charts/ChartInsight";
import { usePropertyMetrics } from "@/hooks/usePropertyMetrics";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import { formatIndianUnits } from "@/utils/format";
import type { Flat, RealEstateProperty, RentalProperty } from "@/types";

interface PropertyMetricsResponse {
  details?: {
    rentalProperties?: RentalProperty[];
    flats?: Flat[];
    realEstate?: RealEstateProperty[];
  };
}

// Chart colours driven by CSS variables for full dark/light theme support
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-5))",
];

// Number of property categories (Rental, Flat, Real Estate)
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
    ? `${topRentalIncome.property} contributes the highest monthly rent (${topRentalIncome.revenue.toLocaleString("en-IN")}), ${((topRentalIncome.revenue / metrics.totalMonthlyRevenue) * 100).toFixed(1)}% of current rental income.`
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

  // Track which lease IDs we have already toasted to avoid duplicates across re-renders
  const shownLeaseIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    metrics.expiringLeases.forEach((property) => {
      if (shownLeaseIds.current.has(property.id)) return;
      shownLeaseIds.current.add(property.id);
      toast.warning("Lease Expiring Soon", {
        description: `${property.property_name} lease expires on ${new Date(property.lease_end_date!).toLocaleDateString()}`,
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
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive property performance metrics and insights"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Occupancy Rate"
          value={`${metrics.occupancyRate.toFixed(1)}%`}
          change={`${occupiedCount} of ${rentalProperties.length} rentals occupied`}
          changeType="neutral"
          icon={Activity}
        />
        <MetricCard
          title="Monthly Revenue"
          value={formatIndianUnits(metrics.totalMonthlyRevenue)}
          change="Rental Income"
          changeType="neutral"
          icon={DollarSign}
        />
        <MetricCard
          title="Total Properties"
          value={metrics.totalProperties}
          change={`${PROPERTY_CATEGORY_COUNT} categories`}
          changeType="neutral"
          icon={Home}
        />
        <MetricCard
          title="Portfolio Value"
          value={formatIndianUnits(metrics.totalPropertyValue)}
          change="Market Valuation"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Monthly Rental Income by Property" icon={TrendingUp} className="glass-card">
          {metrics.rentalRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={metrics.rentalRevenueData} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatIndianUnits(v)} />
                <YAxis
                  dataKey="property"
                  type="category"
                  width={120}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value: number) => [formatIndianUnits(value), "Monthly rent"]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} name="Monthly rent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
              No occupied rental income is available.
            </div>
          )}
          <ChartInsight>{rentalIncomeInsight}</ChartInsight>
        </ChartCard>

        <ChartCard title="Property Status" icon={PieIcon} className="glass-card">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={metrics.statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
              >
                {metrics.statusDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
          <ChartInsight>{statusInsight}</ChartInsight>
        </ChartCard>

        <ChartCard title="Property Distribution" icon={Users} className="glass-card">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={metrics.propertyTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                cursor={{ fill: "hsl(var(--muted)/0.1)" }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                name="Properties"
              />
            </BarChart>
          </ResponsiveContainer>
          <ChartInsight>{propertyTypeInsight}</ChartInsight>
        </ChartCard>
      </div>

      {metrics.expiringLeases.length > 0 && (
        <Card className="glass-card border-none overflow-hidden">
          <CardHeader className="bg-amber-500/10 border-b border-amber-500/20">
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Calendar className="h-5 w-5" />
              Upcoming Lease Expirations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {metrics.expiringLeases.map((property) => {
                const daysLeft = Math.ceil(
                  (new Date(property.lease_end_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{property.property_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Tenant: {property.tenant_name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        Expires {new Date(property.lease_end_date!).toLocaleDateString()}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-1 border-amber-500/50 text-amber-600 bg-amber-500/5"
                      >
                        {daysLeft} days left
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
