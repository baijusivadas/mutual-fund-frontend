import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "@/components/tables/UsersTable";
import { PurchasesTable } from "@/components/tables/PurchasesTable";
import { RedemptionsTable } from "@/components/tables/RedemptionsTable";
import { MutualFundsTable } from "@/components/tables/MutualFundsTable";
import { useInvestor } from "@/contexts/InvestorContext";
import { useMemo } from "react";
import {
  categorizeUsers,
  categorizePurchases,
  categorizeRedemptions,
  categorizeMutualFunds,
} from "@/utils/categorizeTransactions";

const TransactionReports = () => {
  const { filteredTransactions } = useInvestor();

  const users = useMemo(() => categorizeUsers(filteredTransactions), [filteredTransactions]);
  const purchases = useMemo(() => categorizePurchases(filteredTransactions), [filteredTransactions]);
  const redemptions = useMemo(() => categorizeRedemptions(filteredTransactions), [filteredTransactions]);
  const funds = useMemo(() => categorizeMutualFunds(filteredTransactions), [filteredTransactions]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transaction Reports</h2>
          <p className="text-muted-foreground">
            Comprehensive view of investors, purchases, redemptions, and mutual funds
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">
              Investors ({users.length})
            </TabsTrigger>
            <TabsTrigger value="purchases">
              Purchases ({purchases.length})
            </TabsTrigger>
            <TabsTrigger value="redemptions">
              Redemptions ({redemptions.length})
            </TabsTrigger>
            <TabsTrigger value="funds">
              Mutual Funds ({funds.length})
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
    </DashboardLayout>
  );
};

export default TransactionReports;
