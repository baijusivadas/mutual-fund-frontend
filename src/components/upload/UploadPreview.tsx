import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { ParsedTransaction } from "@/utils/excelParser";

interface UploadPreviewProps {
    file: File | null;
    parsedData: ParsedTransaction[];
    purchaseCount: number;
    redemptionCount: number;
}

export const UploadPreview = ({
    file,
    parsedData,
    purchaseCount,
    redemptionCount,
}: UploadPreviewProps) => {
    if (!file || parsedData.length === 0) return null;

    return (
        <Card className="bg-muted/50">
            <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <span className="font-medium">{file.name}</span>
                    </div>
                    <Badge variant="outline">{parsedData.length} transactions</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-success/10">
                        <p className="text-muted-foreground">Purchases</p>
                        <p className="text-lg font-semibold text-success">{purchaseCount}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10">
                        <p className="text-muted-foreground">Redemptions</p>
                        <p className="text-lg font-semibold text-destructive">{redemptionCount}</p>
                    </div>
                </div>

                {/* Preview */}
                <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Preview (first 5 rows):</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Type</th>
                                    <th className="text-left p-2">Investor</th>
                                    <th className="text-left p-2">Scheme</th>
                                    <th className="text-right p-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.slice(0, 5).map((txn, i) => (
                                    <tr key={i} className="border-b border-dashed">
                                        <td className="p-2">{txn.transactionType}</td>
                                        <td className="p-2">{txn.investorName}</td>
                                        <td className="p-2 truncate max-w-[150px]">{txn.schemeName}</td>
                                        <td className="p-2 text-right">
                                            ₹{txn.amount.toLocaleString("en-IN")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
