import { useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Home, Users, Calendar, Loader2, Activity, PieChart as PieIcon, ArrowUpRight } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChartCard, chartTooltipStyle } from "@/components/charts/ChartCard";
import { usePropertyMetrics } from "@/hooks/usePropertyMetrics";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function Analytics() {
  const { token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["portfolio-metrics"],
    queryFn: async () => {
      const response = await api.get("/analytics/metrics");
      return response.data;
    },
    enabled: !!token,
  });

  const rentalProperties = data?.details?.rentalProperties || [];
  const flats = data?.details?.flats || [];
  const realEstate = data?.details?.realEstate || [];

  const metrics = usePropertyMetrics(rentalProperties, flats, realEstate);

  // Track which lease IDs we've already toasted to avoid duplicates across re-renders
  const shownLeaseIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    metrics.expiringLeases.forEach((property: any) => {
      if (shownLeaseIds.current.has(property.id)) return; // already shown
      shownLeaseIds.current.add(property.id);
      toast.warning(`Lease Expiring Soon`, {
        description: `${property.property_name} lease expires on ${new Date(property.lease_end_date!).toLocaleDateString()}`,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics.expiringLeases.map((p: any) => p.id).join(",")]);
  // ↑ Stable string key — only re-runs when the set of expiring lease IDs actually changes

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader 
        title="Analytics Dashboard" 
        description="Comprehensive property performance metrics and insights" 
      />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard 
            title="Occupancy Rate" 
            value={`${metrics.occupancyRate.toFixed(1)}%`} 
            change="+2.4% from last month"
            changeType="positive"
            icon={Activity} 
          />
          <MetricCard 
            title="Monthly Revenue" 
            value={`₹${metrics.totalMonthlyRevenue.toLocaleString()}`} 
            change="Target: ₹10L"
            changeType="neutral"
            icon={DollarSign} 
          />
          <MetricCard 
            title="Total Properties" 
            value={metrics.totalProperties} 
            change="3 categories"
            changeType="neutral"
            icon={Home} 
          />
          <MetricCard 
            title="Portfolio Value" 
            value={`₹${(metrics.totalPropertyValue / 10000000).toFixed(2)}Cr`} 
            change="Market Valuation"
            changeType="positive"
            icon={TrendingUp} 
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <ChartCard title="Revenue Trends" icon={TrendingUp} className="glass-card">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={metrics.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} name="Monthly Revenue" />
              </LineChart>
            </ResponsiveContainer>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Revenue by Type" icon={DollarSign} className="glass-card">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={metrics.propertyTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(var(--muted)/0.1)' }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Monthly Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Property Distribution" icon={Users} className="glass-card">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={metrics.propertyTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(var(--muted)/0.1)' }} />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} name="Property Count" />
              </BarChart>
            </ResponsiveContainer>
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
                {metrics.expiringLeases.map((property: any) => (
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
                        <p className="text-sm text-muted-foreground">Tenant: {property.tenant_name || "N/A"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">Expires {new Date(property.lease_end_date!).toLocaleDateString()}</p>
                      <Badge variant="outline" className="mt-1 border-amber-500/50 text-amber-600 bg-amber-500/5">
                        {Math.ceil((new Date(property.lease_end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </DashboardLayout>
  );
}
