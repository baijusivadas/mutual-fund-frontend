import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { investorApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Building2, CreditCard, ShieldCheck } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";
import { CommonCard } from "@/components/shared/CommonCard";

interface Investor {
  id: string;
  full_name: string;
  pan: string;
  email: string;
  InvestorKyc?: { kyc_status: string };
  InvestorBankAccounts?: { is_primary: boolean }[];
}

const Investors = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investors = [], isLoading } = useQuery({
    queryKey: ["investors"],
    queryFn: async () => {
      const res = await investorApi.getAll();
      return res.data;
    },
  });

  const createInvestorMutation = useMutation({
    mutationFn: (data: any) => investorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      toast({ title: "Success", description: "Investor created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.error || "Failed to create investor", 
        variant: "destructive" 
      });
    }
  });

  const columns: ColumnConfig<Investor>[] = [
    { key: "full_name", label: "Investor Name", sortable: true, className: "font-medium" },
    { key: "pan", label: "PAN", sortable: true, className: "font-mono text-sm uppercase", render: (item) => item.pan || 'N/A' },
    { key: "email", label: "Email", sortable: true, render: (item) => item.email || 'N/A' },
    { 
      key: "kyc_status", 
      label: "KYC Status", 
      sortable: true,
      render: (item) => (
        <Badge 
          variant={item.InvestorKyc?.kyc_status === 'Verified' ? 'default' : 'secondary'}
          className={item.InvestorKyc?.kyc_status === 'Verified' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
        >
          {item.InvestorKyc?.kyc_status || 'Pending'}
        </Badge>
      )
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Investors" 
        description="Manage your family member profiles and investment entities."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-105">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Investor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Investor</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 py-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createInvestorMutation.mutate(Object.fromEntries(formData));
              }}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input name="full_name" placeholder="Enter full name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">PAN</label>
                    <Input name="pan" placeholder="ABCDE1234F" className="uppercase" maxLength={10} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date of Birth</label>
                    <Input name="date_of_birth" type="date" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input name="email" type="email" placeholder="investor@example.com" />
                </div>
                <Button type="submit" className="w-full" disabled={createInvestorMutation.isPending}>
                  {createInvestorMutation.isPending ? "Creating..." : "Create Investor"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investors?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">KYC Verified</CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {investors?.filter((i: any) => i.InvestorKyc?.kyc_status === 'Verified').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Primary Bank Linked</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {investors?.filter((i: any) => i.InvestorBankAccounts?.some((b: any) => b.is_primary)).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <CommonCard noHeader>
          <CommonTable<Investor>
            data={investors}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Search by name or PAN..."
            searchKeys={["full_name", "pan"]}
            emptyMessage="No investors found"
          />
        </CommonCard>
      </div>
    </DashboardLayout>
  );
};

export default Investors;
