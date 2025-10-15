import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useInvestor } from "@/contexts/InvestorContext";
import { useState, useMemo } from "react";

const Transactions = () => {
  const { filteredTransactions } = useInvestor();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter transactions based on search and type
  const displayedTransactions = useMemo(() => {
    return filteredTransactions
      .filter((t) => {
        // Search filter - safely handle null/undefined values
        const searchLower = searchQuery.toLowerCase().trim();
        const matchesSearch = searchQuery === "" || 
          (t.schemeName?.toLowerCase() || "").includes(searchLower) ||
          (t.investorName?.toLowerCase() || "").includes(searchLower) ||
          (t.folioNumber?.toLowerCase() || "").includes(searchLower);
        
        // Type filter
        const txType = (t.transactionType || "").toLowerCase();
        const isPurchase = txType.includes('purchase') || txType.includes('systematic');
        const isRedemption = txType.includes('redeem') || txType.includes('switchout') || txType.includes('switch');
        
        const matchesType = typeFilter === "all" ||
          (typeFilter === "purchase" && isPurchase) ||
          (typeFilter === "redemption" && isRedemption);
        
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime());
  }, [filteredTransactions, searchQuery, typeFilter]);

  const getTransactionType = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('purchase') || lowerType.includes('systematic')) {
      return { label: 'PURCHASE', variant: 'default' as const, icon: ArrowDownLeft };
    }
    if (lowerType.includes('redeem') || lowerType.includes('switchout')) {
      return { label: 'REDEMPTION', variant: 'destructive' as const, icon: ArrowUpRight };
    }
    return { label: type.toUpperCase(), variant: 'secondary' as const, icon: Search };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Daily Sauda Report</h2>
          <p className="text-muted-foreground">Complete transaction history from all investors</p>
        </div>

        {/* Enhanced Search and Filter Section */}
        <Card className="border-2">
          <CardContent className="pt-6">
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
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[200px] h-11">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="purchase">Purchases & SIP</SelectItem>
                    <SelectItem value="redemption">Redemptions & Switchout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{displayedTransactions.length}</span> of{" "}
                  <span className="font-semibold text-foreground">{filteredTransactions.length}</span> transactions
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
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {displayedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedTransactions.map((transaction, index) => {
                  const txType = getTransactionType(transaction.transactionType);
                  const Icon = txType.icon;
                  
                  return (
                    <Card key={`${transaction.folioNumber}-${index}`} className="border hover:border-primary/50 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          {/* Left Section */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge 
                                variant={txType.variant}
                                className="font-bold flex items-center gap-1"
                              >
                                <Icon className="h-3 w-3" />
                                {txType.label}
                              </Badge>
                              <span className="text-xs font-mono text-muted-foreground">
                                {transaction.folioNumber}
                              </span>
                            </div>
                            <h3 className="text-base font-bold mb-1 line-clamp-2">
                              {transaction.schemeName}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {transaction.investorName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{new Date(transaction.investmentDate).toLocaleDateString('en-IN')}</span>
                              <span>•</span>
                              <span className="font-mono">{transaction.transactionType}</span>
                            </div>
                          </div>

                          {/* Right Section */}
                          <div className="text-right space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Total Value</p>
                              <p className="text-xl font-bold">
                                ₹{Math.abs(transaction.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <p className="text-muted-foreground">Units</p>
                                <p className="font-semibold">
                                  {Math.abs(transaction.units).toLocaleString('en-IN', { maximumFractionDigits: 3 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">NAV</p>
                                <p className="font-semibold">
                                  ₹{transaction.nav.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
