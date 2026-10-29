import { memo, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { investorApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Building2, CreditCard, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";
import { CommonCard } from "@/components/shared/CommonCard";
import { MetricCard } from "@/components/shared/MetricCard";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

interface Investor {
  id: string;
  full_name: string;
  pan: string;
  email: string;
  InvestorKyc?: { kyc_status: string };
  InvestorBankAccounts?: { is_primary: boolean }[];
}

interface InvestorCreateData {
  [key: string]: FormDataEntryValue;
}

const SEARCH_KEYS: (keyof Investor)[] = ["full_name", "pan"];

const Investors = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investors = [], isLoading } = useQuery<Investor[]>({
    queryKey: ["investors"],
    queryFn: async () => {
      const res = await investorApi.getAll();
      // Backend uses sendSuccess: { status, message, data: [...] }
      const items = res.data?.data ?? res.data;
      return Array.isArray(items) ? items : [];
    },
  });

  const createInvestorMutation = useMutation({
    mutationFn: (data: InvestorCreateData) => investorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      toast({ title: "Success", description: "Investor registered successfully" });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to create investor"),
        variant: "destructive",
      });
    },
  });

  const { totalCount, verifiedCount, bankLinkedCount } = useMemo(() => {
    let verified = 0;
    let bankLinked = 0;

    for (const inv of investors) {
      if (inv.InvestorKyc?.kyc_status === "Verified") {
        verified++;
      }
      if (inv.InvestorBankAccounts?.some((acc) => acc.is_primary)) {
        bankLinked++;
      }
    }

    return {
      totalCount: investors.length,
      verifiedCount: verified,
      bankLinkedCount: bankLinked,
    };
  }, [investors]);

  const columns: ColumnConfig<Investor>[] = useMemo(
    () => [
      { key: "full_name", label: "Investor Name", sortable: true, className: "font-semibold text-foreground" },
      {
        key: "pan",
        label: "PAN",
        sortable: true,
        className: "font-mono text-xs uppercase font-bold",
        render: (item) => <span className="bg-muted/60 px-2 py-0.5 rounded-md">{item.pan || "N/A"}</span>,
      },
      { key: "email", label: "Email", sortable: true, render: (item) => item.email || <span className="text-muted-foreground">-</span> },
      {
        key: "kyc_status",
        label: "KYC Status",
        sortable: true,
        render: (item) => {
          const isVerified = item.InvestorKyc?.kyc_status === "Verified";
          return (
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border-none",
                isVerified
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              )}
            >
              {item.InvestorKyc?.kyc_status || "Pending"}
            </Badge>
          );
        },
      },
    ],
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      createInvestorMutation.mutate(Object.fromEntries(formData));
    },
    [createInvestorMutation]
  );

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Investor Management"
        description="Manage family member profiles, KYC status, and linked bank accounts"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="font-bold">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Investor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Investor</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 py-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                  <Input name="full_name" placeholder="Enter full name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">PAN *</label>
                    <Input
                      name="pan"
                      placeholder="ABCDE1234F"
                      className="uppercase font-mono"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date of Birth *</label>
                    <Input name="date_of_birth" type="date" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <Input name="email" type="email" placeholder="investor@example.com" />
                </div>
                <Button
                  type="submit"
                  className="w-full font-bold"
                  disabled={createInvestorMutation.isPending}
                >
                  {createInvestorMutation.isPending ? "Registering..." : "Register Investor"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Investors"
          value={totalCount}
          change="Registered Profiles"
          changeType="neutral"
          icon={Building2}
        />
        <MetricCard
          title="KYC Verified"
          value={verifiedCount}
          change={`${totalCount > 0 ? ((verifiedCount / totalCount) * 100).toFixed(0) : 0}% Compliance`}
          changeType="positive"
          icon={ShieldCheck}
        />
        <MetricCard
          title="Primary Bank Linked"
          value={bankLinkedCount}
          change="Direct Settlement Ready"
          changeType="neutral"
          icon={CreditCard}
        />
      </div>

      <CommonCard noHeader className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200">
        <CommonTable<Investor>
          data={investors}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Search by name or PAN..."
          searchKeys={SEARCH_KEYS}
          emptyMessage="No investors registered yet. Add your first investor above!"
        />
      </CommonCard>
    </div>
  );
};

export default memo(Investors);
