import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MutualFundSummary } from "@/utils/categorizeTransactions";
import { PieChart } from "lucide-react";

interface MutualFundsTableProps {
  funds: MutualFundSummary[];
}

export const MutualFundsTable = ({ funds }: MutualFundsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Mutual Funds Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted-foreground">Scheme Name</th>
                <th className="pb-3 text-center font-medium text-muted-foreground">Investors</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Total Units</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Latest NAV</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Total Investment</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Total Redemption</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Net Investment</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Current Value</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((fund, index) => {
                const currentValue = fund.totalUnits * fund.latestNav;
                const returns = currentValue - fund.netInvestment;
                const returnPercent = fund.netInvestment > 0 
                  ? ((returns / fund.netInvestment) * 100) 
                  : 0;

                return (
                  <tr 
                    key={index} 
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-4 text-sm font-medium text-foreground max-w-md">
                      {fund.schemeName}
                    </td>
                    <td className="py-4 text-center">
                      <Badge variant="outline">
                        {fund.totalInvestors}
                      </Badge>
                    </td>
                    <td className="py-4 text-right text-sm text-foreground">
                      {fund.totalUnits.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-right text-sm text-muted-foreground">
                      ₹{fund.latestNav.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-right text-sm text-foreground">
                      ₹{fund.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-4 text-right text-sm text-muted-foreground">
                      ₹{fund.totalRedemption.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-4 text-right text-sm font-medium text-foreground">
                      ₹{fund.netInvestment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-sm font-medium ${
                          returns >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                        <Badge 
                          variant={returns >= 0 ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {returns >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
