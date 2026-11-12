import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { VList } from "virtua";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CommonCard } from "@/components/shared/CommonCard";
import { CommonSelect } from "@/components/shared/CommonSelect";
import { Search, ArrowUpRight, ArrowDownLeft, X, Filter } from "lucide-react";
import { useInvestor } from "@/contexts/InvestorContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useUserInvestments } from "@/hooks/useUserInvestments";
import { TransactionData } from "@/utils/parseTransactions";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

// ── Pure helper — defined outside component so it is never recreated ──────────
const getTransactionType = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("purchase") || lowerType.includes("systematic")) {
    return {
      label: "PURCHASE",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: ArrowDownLeft,
      isSell: false,
    };
  }
  if (lowerType.includes("redeem") || lowerType.includes("switchout")) {
    return {
      label: "REDEMPTION",
      badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: ArrowUpRight,
      isSell: true,
    };
  }
  return {
    label: type.toUpperCase(),
    badgeClass: "bg-muted text-muted-foreground",
    icon: Search,
    isSell: false,
  };
};

// ── Memoized card — only re-renders when its own transaction reference changes ─
const TransactionCard = memo(({ transaction }: { transaction: TransactionData }) => {
  const txType = getTransactionType(transaction.transactionType);
  const Icon = txType.icon;

  return (
    <div className="rounded-xl border border-border bg-card hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-200 p-4 group">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1", txType.badgeClass)}
            >
              <Icon className="h-3 w-3" />
              {txType.label}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
              {transaction.folioNumber}
            </span>
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {transaction.schemeName}
          </h3>
          <p className="text-xs text-muted-foreground mb-2 font-medium">{transaction.investorName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {new Date(transaction.investmentDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span>•</span>
            <span className="font-mono text-[11px]">{transaction.transactionType}</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="sm:text-right space-y-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</p>
            <p
              className={cn(
                "text-lg font-heading font-extrabold mt-0.5",
                txType.isSell ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {txType.isSell ? "-" : "+"}₹
              {Math.abs(transaction.value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-semibold">Units</p>
              <p className="font-semibold text-foreground">
                {Math.abs(transaction.units).toLocaleString("en-IN", {
                  maximumFractionDigits: 3,
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-semibold">NAV</p>
              <p className="font-semibold text-foreground">
                ₹{transaction.nav.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
TransactionCard.displayName = "TransactionCard";

// ─────────────────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "all", label: "All Transactions" },
  { value: "purchase", label: "Purchases & SIP" },
  { value: "redemption", label: "Redemptions & Switchout" },
];

const Transactions = () => {
  const { filteredTransactions } = useInvestor();
  const { isLoading, error } = useUserInvestments();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [typeFilter, setTypeFilter] = useState("all");

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleTypeFilterChange = useCallback((val: string) => {
    setTypeFilter(val);
  }, []);
  const purchaseCount = useMemo(() => filteredTransactions.filter((transaction) => !transaction.isSell).length, [filteredTransactions]);
  const redemptionCount = useMemo(() => filteredTransactions.filter((transaction) => transaction.isSell).length, [filteredTransactions]);

  // Filter and sort transactions — memoized
  const displayedTransactions = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase().trim();

    return filteredTransactions
      .filter((t) => {
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
      .sort((a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime());
  }, [filteredTransactions, debouncedSearch, typeFilter]);

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title="Transaction History"
        description="Search and review purchases and redemptions from the selected transaction dataset."
      />

      {isLoading && <div role="status" className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">Loading transaction data…</div>}
      {error && (
        <div role="alert" className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>Transaction data could not be loaded.</span>
          <button type="button" onClick={() => void queryClient.invalidateQueries({ queryKey: ["user-investments"] })} className="w-fit font-semibold text-primary hover:underline">Retry</button>
        </div>
      )}

      <section aria-label="Transaction summary" className="grid gap-3 sm:grid-cols-3">
        <CommonCard noHeader className="rounded-2xl border-border/70">
          <p className="text-xs font-medium text-muted-foreground">Transactions in view</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{filteredTransactions.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Before search and type filters</p>
        </CommonCard>
        <CommonCard noHeader className="rounded-2xl border-border/70">
          <p className="text-xs font-medium text-muted-foreground">Purchases</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{purchaseCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Recorded buy and systematic entries</p>
        </CommonCard>
        <CommonCard noHeader className="rounded-2xl border-border/70">
          <p className="text-xs font-medium text-muted-foreground">Redemptions</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{redemptionCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Recorded exits and switch-outs</p>
        </CommonCard>
      </section>

      <div className="space-y-4">
        {/* Search and Filter Bar */}
        <CommonCard noHeader className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by scheme name, investor, or folio number..."
                  className="w-full pl-10 pr-9 h-11 rounded-xl bg-background/50 border-border/60 focus:bg-background"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear transaction search"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <CommonSelect
                value={typeFilter}
                onValueChange={handleTypeFilterChange}
                options={TYPE_OPTIONS}
                placeholder="Filter by type"
                className="w-full sm:w-[220px] h-11 rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3">
              <p>
                Showing{" "}
                <span className="font-bold text-foreground">{displayedTransactions.length}</span> of {filteredTransactions.length} transactions
              </p>
              {searchQuery && (
                <button onClick={handleClearSearch} className="text-primary hover:underline font-semibold">
                  Clear search
                </button>
              )}
            </div>
          </div>
        </CommonCard>

        {/* Transactions Virtualized List */}
        <CommonCard title="Transaction History">
          {isLoading || error ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{isLoading ? "Loading transactions…" : "Transaction records are unavailable"}</p>
            </div>
          ) : displayedTransactions.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Filter className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-base font-bold text-foreground">
                {error ? "Transactions are unavailable" : filteredTransactions.length === 0 ? "No transactions recorded yet" : "No matching transactions found"}
              </p>
              <p className="text-xs text-muted-foreground">
                {error ? "Use retry above to reload the transaction data." : filteredTransactions.length === 0 ? "Transactions will appear here when available." : "Try adjusting your search terms or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="h-[640px] overflow-auto pr-2">
              <VList className="space-y-3">
                {displayedTransactions.map((transaction, index) => (
                  <div
                    key={`${transaction.folioNumber}-${transaction.investmentDate}-${index}`}
                    className="pb-3"
                  >
                    <TransactionCard transaction={transaction} />
                  </div>
                ))}
              </VList>
            </div>
          )}
        </CommonCard>
      </div>
    </div>
  );
};

export default memo(Transactions);
