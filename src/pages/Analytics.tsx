import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Home, Users, Calendar } from "lucide-react";
import { OptimizedMetricCard } from "@/components/OptimizedMetricCard";
import type { RentalProperty, Flat, RealEstateProperty } from "@/types";
import { propertyQueryConfig } from "@/hooks/useQueryConfig";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function Analytics() {
  // Fetch all property data
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

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRentalProperties = rentalProperties.length;
    const occupiedRentals = rentalProperties.filter(p => p.status === "occupied").length;
    const occupancyRate = totalRentalProperties > 0 ? (occupiedRentals / totalRentalProperties) * 100 : 0;

    const totalMonthlyRevenue = rentalProperties
      .filter(p => p.status === "occupied")
      .reduce((sum, p) => sum + Number(p.monthly_rent), 0);

    const totalProperties = totalRentalProperties + flats.length + realEstate.length;
    const totalPropertyValue = [
      ...rentalProperties.map(p => Number(p.deposit)),
      ...flats.map(p => Number(p.price)),
      ...realEstate.map(p => Number(p.price))
    ].reduce((sum, val) => sum + val, 0);

    // Properties by status
    const statusDistribution = [
      { name: "Available", value: [...rentalProperties, ...flats, ...realEstate].filter(p => p.status === "available").length },
      { name: "Occupied/Sold", value: [...rentalProperties, ...flats, ...realEstate].filter(p => p.status === "occupied" || p.status === "sold").length },
      { name: "Maintenance", value: [...rentalProperties, ...flats, ...realEstate].filter(p => p.status === "maintenance").length },
    ].filter(item => item.value > 0);

    // Monthly revenue trends (simulated for last 6 months)
    const revenueData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        revenue: totalMonthlyRevenue * (0.85 + Math.random() * 0.3),
      };
    });

    // Property type distribution
    const propertyTypeData = [
      { name: "Rental Properties", value: rentalProperties.length, revenue: totalMonthlyRevenue },
      { name: "Flats", value: flats.length, revenue: flats.reduce((sum, p) => sum + Number(p.price) * 0.01, 0) },
      { name: "Real Estate", value: realEstate.length, revenue: realEstate.reduce((sum, p) => sum + Number(p.price) * 0.01, 0) },
    ];

    // Lease expiration alerts (properties expiring in 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const expiringLeases = rentalProperties.filter(p => {
      if (!p.lease_end_date) return false;
      const endDate = new Date(p.lease_end_date);
      return endDate >= today && endDate <= thirtyDaysFromNow;
    });

    return {
      occupancyRate,
      totalMonthlyRevenue,
      totalProperties,
      totalPropertyValue,
      statusDistribution,
      revenueData,
      propertyTypeData,
      expiringLeases,
    };
  }, [rentalProperties, flats, realEstate]);

  // Set up real-time subscriptions
  useEffect(() => {
    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Subscribe to rental properties changes
    const rentalChannel = supabase
      .channel('rental-properties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rental_properties'
        },
        (payload) => {
          console.log('Rental property change:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as RentalProperty;
            const oldData = payload.old as RentalProperty;
            
            if (newData.status !== oldData.status) {
              toast.success(`Property Status Updated`, {
                description: `${newData.property_name} status changed to ${newData.status}`,
              });
            }
            
            if (newData.tenant_name && newData.tenant_name !== oldData.tenant_name) {
              toast.info(`New Tenant Assigned`, {
                description: `${newData.tenant_name} assigned to ${newData.property_name}`,
              });
            }
          }
          
          if (payload.eventType === 'INSERT') {
            const newData = payload.new as RentalProperty;
            toast.success(`New Property Added`, {
              description: `${newData.property_name} has been added`,
            });
          }
        }
      )
      .subscribe();
    channels.push(rentalChannel);

    // Subscribe to flats changes
    const flatsChannel = supabase
      .channel('flats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flats'
        },
        (payload) => {
          console.log('Flat change:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as Flat;
            const oldData = payload.old as Flat;
            
            if (newData.status !== oldData.status) {
              toast.success(`Flat Status Updated`, {
                description: `${newData.flat_name} status changed to ${newData.status}`,
              });
            }
          }
          
          if (payload.eventType === 'INSERT') {
            const newData = payload.new as Flat;
            toast.success(`New Flat Added`, {
              description: `${newData.flat_name} has been added`,
            });
          }
        }
      )
      .subscribe();
    channels.push(flatsChannel);

    // Subscribe to real estate changes
    const realEstateChannel = supabase
      .channel('real-estate-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'real_estate'
        },
        (payload) => {
          console.log('Real estate change:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as RealEstateProperty;
            const oldData = payload.old as RealEstateProperty;
            
            if (newData.status !== oldData.status) {
              toast.success(`Property Status Updated`, {
                description: `${newData.property_name} status changed to ${newData.status}`,
              });
            }
          }
          
          if (payload.eventType === 'INSERT') {
            const newData = payload.new as RealEstateProperty;
            toast.success(`New Property Added`, {
              description: `${newData.property_name} has been added`,
            });
          }
        }
      )
      .subscribe();
    channels.push(realEstateChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  // Check for expiring leases on mount
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

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <OptimizedMetricCard
            label="Occupancy Rate"
            value={`${metrics.occupancyRate.toFixed(1)}%`}
            className="text-primary"
          />
          <OptimizedMetricCard
            label="Monthly Revenue"
            value={`₹${metrics.totalMonthlyRevenue.toLocaleString()}`}
            className="text-success"
          />
          <OptimizedMetricCard
            label="Total Properties"
            value={metrics.totalProperties}
            className="text-accent"
          />
          <OptimizedMetricCard
            label="Property Value"
            value={`₹${(metrics.totalPropertyValue / 10000000).toFixed(2)}Cr`}
            className="text-secondary"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Monthly Revenue (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Type Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Property Type Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.propertyTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Monthly Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Count by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Property Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.propertyTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="hsl(var(--accent))" name="Property Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Lease Expiration Alerts */}
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
                      <p className="text-sm text-muted-foreground">
                        Tenant: {property.tenant_name || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Expires: {new Date(property.lease_end_date!).toLocaleDateString()}
                      </p>
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
