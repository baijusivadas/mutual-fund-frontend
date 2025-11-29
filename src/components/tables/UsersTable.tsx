import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserSummary } from "@/utils/categorizeTransactions";
import { Users } from "lucide-react";

interface UsersTableProps {
  users: UserSummary[];
}

export const UsersTable = ({ users }: UsersTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Investors Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted-foreground">Investor Name</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Total Investment</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Total Redemption</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Net Investment</th>
                <th className="pb-3 text-center font-medium text-muted-foreground">Transactions</th>
                <th className="pb-3 text-center font-medium text-muted-foreground">Schemes</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={index} 
                  className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                >
                  <td className="py-4 text-sm font-medium text-foreground">
                    {user.investorName}
                  </td>
                  <td className="py-4 text-right text-sm text-foreground">
                    ₹{user.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-4 text-right text-sm text-muted-foreground">
                    ₹{user.totalRedemption.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-4 text-right">
                    <span className={`text-sm font-medium ${
                      user.netInvestment >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ₹{user.netInvestment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <Badge variant="secondary">
                      {user.transactionCount}
                    </Badge>
                  </td>
                  <td className="py-4 text-center">
                    <Badge variant="outline">
                      {user.schemesInvested}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
