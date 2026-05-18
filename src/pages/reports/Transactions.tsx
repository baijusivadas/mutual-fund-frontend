import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VList } from "virtua";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CommonCard } from "@/components/shared/CommonCard";
import { CommonSelect } from "@/components/shared/CommonSelect";
import { Search, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useInvestor } from "@/contexts/InvestorContext";
import { useState, useMemo, useEffect, memo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { TransactionData } from "@/utils/parseTransactions";
import { PageHeader } from "@/components/shared/PageHeader";

// ── Pure helper — defined outside component so it is never recreated ──────────
const getTransactionType = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("purchase") || lowerType.includes("systematic")) {
    return { label: "PURCHASE", variant: "default" as const, icon: ArrowDownLeft };
  }
  if (lowerType.includes("redeem") || lowerType.includes("switchout")) {
    return { label: "REDEMPTION", variant: "destructive" as const, icon: ArrowUpRight };
  }
  return { label: type.toUpperCase(), variant: "secondary" as const, icon: Search };
};

// ── Memoized card — only re-renders when its own transaction reference changes ─
const TransactionCard = memo(({ transaction }: { transaction: TransactionData }) => {
  const txType = getTransactionType(transaction.transactionType);
  const Icon = txType.icon;

  return (
    <CommonCard noHeader className="border hover:border-primary/50 transition-all" contentClassName="p-4">
      <div className="flex items-start justify-between gap-4">
        {/* Left Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant={txType.variant} className="font-bold flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {txType.label}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">
              {transaction.folioNumber}
            </span>
          </div>
          <h3 className="text-base font-bold mb-1 line-clamp-2">{transaction.schemeName}</h3>
          <p className="text-sm text-muted-foreground mb-2">{transaction.investorName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{new Date(transaction.investmentDate).toLocaleDateString("en-IN")}</span>
            <span>•</span>
            <span className="font-mono">{transaction.transactionType}</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="text-right space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-xl font-bold">
              ₹{Math.abs(transaction.value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Units</p>
              <p className="font-semibold">
                {Math.abs(transaction.units).toLocaleString("en-IN", {
                  maximumFractionDigits: 3,
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">NAV</p>
              <p className="font-semibold">
                ₹{transaction.nav.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </CommonCard>
  );
});
TransactionCard.displayName = "TransactionCard";

// ─────────────────────────────────────────────────────────────────────────────

const Transactions = () => {
  const { filteredTransactions } = useInvestor();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(50);
  const ITEMS_PER_PAGE = 50;

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [debouncedSearch, typeFilter, filteredTransactions]);

  // Filter and sort transactions — memoized to avoid recompute on unrelated renders
  const displayedTransactions = useMemo(() => {
    return filteredTransactions
      .filter((t) => {
        const searchLower = debouncedSearch.toLowerCase().trim();
        const matchesSearch =
          debouncedSearch === "" ||
          (t.schemeName?.toLowerCase() || "").includes(searchLower) ||
          (t.investorName?.toLowerCase() || "").includes(searchLower) ||
          (t.folioNumber?.toLowerCase() || "").includes(searchLower);

        const matchesType =
          typeFilter === "all" ||
          (typeFilter === "purchase" && !t.isSell) ||
          (typeFilter === "redemption" && t.isSell);

        return matchesSearch && matchesType;
      })
      .sort(
        (a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime()
      );
  }, [filteredTransactions, debouncedSearch, typeFilter]);

  return (
    <DashboardLayout>
      <PageHeader 
        title="Daily Sauda Report" 
        description="Complete transaction history from all investors" 
      />

      <div className="space-y-6">
        {/* Search and Filter */}
        <CommonCard noHeader className="border-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by scheme, investor name, or folio number..."
                  className="w-full pl-10 h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
                <CommonSelect
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                  options={[
                    { value: "all", label: "All Transactions" },
                    { value: "purchase", label: "Purchases & SIP" },
                    { value: "redemption", label: "Redemptions & Switchout" }
                  ]}
                  placeholder="Filter by type"
                  className="w-full sm:w-[200px] h-11"
                />
            </div>
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(visibleCount, displayedTransactions.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {displayedTransactions.length}
                </span>{" "}
                transactions
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-primary hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        </CommonCard>

        {/* Transactions List */}
        <CommonCard
          title="Transaction History"
        >
          {displayedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="h-[600px] overflow-auto pr-2">
              <VList className="space-y-3">
                {displayedTransactions.map((transaction, index) => (
                  <div key={`${transaction.folioNumber}-${transaction.investmentDate}-${index}`} className="pb-3">
                    <TransactionCard transaction={transaction} />
                  </div>
                ))}
              </VList>
            </div>
          )}
        </CommonCard>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
