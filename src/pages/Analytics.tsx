import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Home, Users, Calendar } from "lucide-react";
import { OptimizedMetricCard } from "@/components/OptimizedMetricCard";
import { ChartCard, chartTooltipStyle } from "@/components/charts/ChartCard";
import { usePropertyMetrics } from "@/hooks/usePropertyMetrics";
import { useRealtimePropertyChanges } from "@/hooks/useRealtimePropertyChanges";
import type { RentalProperty, Flat, RealEstateProperty } from "@/types";
import { propertyQueryConfig } from "@/hooks/useQueryConfig";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function Analytics() {
  const { data: rentalProperties = [] } = useQuery({
    queryKey: ["rental-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RentalProperty[];
    },
    ...propertyQueryConfig,
  });

  const { data: flats = [] } = useQuery({
    queryKey: ["flats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flats")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Flat[];
    },
    ...propertyQueryConfig,
  });

  const { data: realEstate = [] } = useQuery({
    queryKey: ["real-estate"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("real_estate")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RealEstateProperty[];
    },
    ...propertyQueryConfig,
  });

  const metrics = usePropertyMetrics(rentalProperties, flats, realEstate);

  useRealtimePropertyChanges({
    tables: ['rental_properties', 'flats', 'real_estate'],
  });

  useEffect(() => {
    if (metrics.expiringLeases.length > 0) {
      metrics.expiringLeases.forEach(property => {
        toast.warning(`Lease Expiring Soon`, {
          description: `${property.property_name} lease expires on ${new Date(property.lease_end_date!).toLocaleDateString()}`,
        });
      });
    }
  }, [metrics.expiringLeases]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive property performance metrics and insights
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <OptimizedMetricCard label="Occupancy Rate" value={`${metrics.occupancyRate.toFixed(1)}%`} className="text-primary" />
          <OptimizedMetricCard label="Monthly Revenue" value={`₹${metrics.totalMonthlyRevenue.toLocaleString()}`} className="text-success" />
          <OptimizedMetricCard label="Total Properties" value={metrics.totalProperties} className="text-accent" />
          <OptimizedMetricCard label="Property Value" value={`₹${(metrics.totalPropertyValue / 10000000).toFixed(2)}Cr`} className="text-secondary" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard title="Revenue Trends" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Monthly Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Property Status" icon={Home}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {metrics.statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Property Type Revenue" icon={DollarSign}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.propertyTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Monthly Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Property Distribution" icon={Users}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.propertyTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--accent))" name="Property Count" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {metrics.expiringLeases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-warning" />
                Upcoming Lease Expirations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.expiringLeases.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between border-l-4 border-warning bg-warning/10 p-3 rounded"
                  >
                    <div>
                      <p className="font-medium">{property.property_name}</p>
                      <p className="text-sm text-muted-foreground">Tenant: {property.tenant_name || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Expires: {new Date(property.lease_end_date!).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.ceil((new Date(property.lease_end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}