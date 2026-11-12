import { memo, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "@/components/tables/UsersTable";
import { PurchasesTable } from "@/components/tables/PurchasesTable";
import { RedemptionsTable } from "@/components/tables/RedemptionsTable";
import { MutualFundsTable } from "@/components/tables/MutualFundsTable";
import { useInvestor } from "@/contexts/InvestorContext";
import {
  categorizeUsers,
  categorizePurchases,
  categorizeRedemptions,
  categorizeMutualFunds,
} from "@/utils/categorizeTransactions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { FileSearch, ListChecks, Search, Users, Wallet, X } from "lucide-react";
import { useUserInvestments } from "@/hooks/useUserInvestments";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

const TransactionReports = () => {
  const { filteredTransactions: transactions } = useInvestor();
  const { isLoading, error } = useUserInvestments();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const reportTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return transactions;
    return transactions.filter((transaction) =>
      [transaction.investorName, transaction.schemeName, transaction.transactionType, transaction.folioNumber]
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [transactions, searchQuery]);
  const users = useMemo(() => categorizeUsers(reportTransactions), [reportTransactions]);
  const purchases = useMemo(
    () => categorizePurchases(reportTransactions),
    [reportTransactions]
  );
  const redemptions = useMemo(
    () => categorizeRedemptions(reportTransactions),
    [reportTransactions]
  );
  const funds = useMemo(() => categorizeMutualFunds(reportTransactions), [reportTransactions]);
  const EmptyReport = ({ label }: { label: string }) => (
    <Card className="rounded-2xl border-dashed border-border">
      <CardContent className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
        <FileSearch className="mb-3 h-8 w-8 text-muted-foreground/60" />
        <p className="font-semibold text-foreground">
          {searchQuery.trim() ? `No ${label.toLowerCase()} match this search` : `No ${label.toLowerCase()} to report`}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchQuery.trim() ? "Try another search term or clear your search." : "This report will populate when matching transactions are available."}
        </p>
        {searchQuery.trim() && <button type="button" onClick={() => setSearchQuery("")} className="mt-2 text-sm font-semibold text-primary hover:underline">Clear search</button>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title="Transaction Reports"
        description="Explore investor activity, purchases, redemptions, and scheme positions from the selected transaction dataset."
      />
      {isLoading && <div role="status" className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">Loading transaction data…</div>}
      {error && (
        <div role="alert" className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>Transaction reports could not be loaded.</span>
          <button type="button" onClick={() => void queryClient.invalidateQueries({ queryKey: ["user-investments"] })} className="w-fit font-semibold text-primary hover:underline">Retry</button>
        </div>
      )}
      {!isLoading && !error && <>
      <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search investor, scheme, type, or folio"
            className="h-10 rounded-xl pl-9 pr-9"
            aria-label="Search transaction reports"
          />
          {searchQuery && (
            <button type="button" aria-label="Clear report search" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Showing <span className="font-semibold text-foreground">{reportTransactions.length}</span> of {transactions.length} transactions
        </p>
      </div>
      <section aria-label="Transaction report summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border/80">
          <CardContent className="flex items-center gap-3 p-4">
            <ListChecks className="h-5 w-5 shrink-0 text-primary" />
            <div><p className="text-xs text-muted-foreground">Transactions in view</p><p className="text-xl font-bold">{reportTransactions.length}</p></div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80">
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-5 w-5 shrink-0 text-primary" />
            <div><p className="text-xs text-muted-foreground">Investors</p><p className="text-xl font-bold">{users.length}</p></div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80">
          <CardContent className="flex items-center gap-3 p-4">
            <Wallet className="h-5 w-5 shrink-0 text-emerald-600" />
            <div><p className="text-xs text-muted-foreground">Purchases</p><p className="text-xl font-bold">{purchases.length}</p></div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80">
          <CardContent className="flex items-center gap-3 p-4">
            <Wallet className="h-5 w-5 shrink-0 rotate-180 text-rose-600" />
            <div><p className="text-xs text-muted-foreground">Redemptions</p><p className="text-xl font-bold">{redemptions.length}</p></div>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:max-w-3xl sm:grid-cols-4">
            <TabsTrigger value="users" className="min-w-0 rounded-lg px-2 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Investors <span className="ml-1 text-muted-foreground">({users.length})</span>
            </TabsTrigger>
            <TabsTrigger value="purchases" className="min-w-0 rounded-lg px-2 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Purchases <span className="ml-1 text-muted-foreground">({purchases.length})</span>
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="min-w-0 rounded-lg px-2 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Redemptions <span className="ml-1 text-muted-foreground">({redemptions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="funds" className="min-w-0 rounded-lg px-2 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Funds <span className="ml-1 text-muted-foreground">({funds.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {users.length ? <UsersTable users={users} /> : <EmptyReport label="Investor records" />}
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            {purchases.length ? <PurchasesTable purchases={purchases} /> : <EmptyReport label="Purchase transactions" />}
          </TabsContent>

          <TabsContent value="redemptions" className="space-y-4">
            {redemptions.length ? <RedemptionsTable redemptions={redemptions} /> : <EmptyReport label="Redemption transactions" />}
          </TabsContent>

          <TabsContent value="funds" className="space-y-4">
            {funds.length ? <MutualFundsTable funds={funds} /> : <EmptyReport label="Mutual fund positions" />}
          </TabsContent>
        </Tabs>
      </>}
    </div>
  );
};

export default memo(TransactionReports);
