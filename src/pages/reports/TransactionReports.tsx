import { memo, useMemo } from "react";
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

const TransactionReports = () => {
  const { filteredTransactions } = useInvestor();

  const users = useMemo(() => categorizeUsers(filteredTransactions), [filteredTransactions]);
  const purchases = useMemo(
    () => categorizePurchases(filteredTransactions),
    [filteredTransactions]
  );
  const redemptions = useMemo(
    () => categorizeRedemptions(filteredTransactions),
    [filteredTransactions]
  );
  const funds = useMemo(() => categorizeMutualFunds(filteredTransactions), [filteredTransactions]);

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Transaction Reports"
        description="Consolidated breakdown of active investors, buy purchases, redemptions, and mutual fund positions"
      />
      <div className="space-y-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-2 sm:grid-cols-4 bg-muted/60 p-1 rounded-xl border border-border/50">
            <TabsTrigger value="users" className="rounded-lg text-xs font-bold">
              Investors ({users.length})
            </TabsTrigger>
            <TabsTrigger value="purchases" className="rounded-lg text-xs font-bold">
              Purchases ({purchases.length})
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="rounded-lg text-xs font-bold">
              Redemptions ({redemptions.length})
            </TabsTrigger>
            <TabsTrigger value="funds" className="rounded-lg text-xs font-bold">
              Funds ({funds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UsersTable users={users} />
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            <PurchasesTable purchases={purchases} />
          </TabsContent>

          <TabsContent value="redemptions" className="space-y-4">
            <RedemptionsTable redemptions={redemptions} />
          </TabsContent>

          <TabsContent value="funds" className="space-y-4">
            <MutualFundsTable funds={funds} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default memo(TransactionReports);
