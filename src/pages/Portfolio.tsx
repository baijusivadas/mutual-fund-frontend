import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useInvestor } from "@/contexts/InvestorContext";
import { useMemo } from "react";
import { TransactionData } from "@/utils/parseTransactions";

const Portfolio = () => {
  const { filteredTransactions, selectedInvestor } = useInvestor();

  // Group by scheme and calculate totals
  const mutualFunds = useMemo(() => {
    const schemes = new Map<string, {
      name: string;
      units: number;
      invested: number;
      nav: number;
      transactions: TransactionData[];
    }>();

    filteredTransactions.forEach((t) => {
      const existing = schemes.get(t.schemeName);
      const invested = t.transactionType.toLowerCase().includes("redeem") || t.transactionType.toLowerCase().includes("switchout") 
        ? -t.value 
        : t.value;
      const units = t.transactionType.toLowerCase().includes("redeem") || t.transactionType.toLowerCase().includes("switchout")
        ? -t.units 
        : t.units;

      if (existing) {
        existing.units += units;
        existing.invested += invested;
        existing.nav = t.nav;
        existing.transactions.push(t);
      } else {
        schemes.set(t.schemeName, {
          name: t.schemeName,
          units: units,
          invested: invested,
          nav: t.nav,
          transactions: [t],
        });
      }
    });

    return Array.from(schemes.values())
      .filter((s) => s.units > 0.01) // Filter out schemes with negligible units
      .map((s) => {
        const value = s.units * s.nav;
        const returns = value - s.invested;
        const returnPercent = s.invested > 0 ? (returns / s.invested) * 100 : 0;
        
        return {
          name: s.name,
          units: s.units,
          nav: s.nav,
          value: value,
          invested: s.invested,
          returns: returns,
          returnPercent: returnPercent,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground">
            {selectedInvestor === "all" ? "All Investors" : selectedInvestor} - Complete Investment Portfolio
          </p>
        </div>

        <Tabs defaultValue="mutualfunds" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-1">
            <TabsTrigger value="mutualfunds">Mutual Funds Holdings</TabsTrigger>
          </TabsList>

          <TabsContent value="mutualfunds" className="mt-6">
            {mutualFunds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mutualFunds.map((fund, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold line-clamp-2">{fund.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {fund.units.toLocaleString('en-IN', { maximumFractionDigits: 2 })} units • NAV ₹{fund.nav.toFixed(2)}
                            </p>
                          </div>
                          <Badge 
                            variant={fund.returns >= 0 ? "default" : "destructive"}
                            className="text-xs font-bold flex-shrink-0"
                          >
                            {fund.returns >= 0 ? '+' : ''}{fund.returnPercent.toFixed(1)}%
                          </Badge>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-3 border-t pt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Invested</p>
                            <p className="text-base font-bold">₹{(fund.invested / 1000).toFixed(1)}K</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Current Value</p>
                            <p className="text-base font-bold text-primary">₹{(fund.value / 1000).toFixed(1)}K</p>
                          </div>
                        </div>

                        {/* Returns */}
                        <div className="space-y-1.5 border-t pt-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Total Returns</span>
                            <span className={`font-semibold ${fund.returns >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {fund.returns >= 0 ? '+' : ''}₹{(fund.returns / 1000).toFixed(1)}K
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${fund.returns >= 0 ? 'bg-success' : 'bg-destructive'}`}
                              style={{ width: `${Math.min(Math.abs(fund.returnPercent), 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No mutual fund holdings found for the selected investor.</p>
                  <p className="text-sm text-muted-foreground mt-2">Transaction data will appear here once loaded.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
