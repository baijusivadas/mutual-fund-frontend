import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { formatIndianUnits } from "@/utils/format";
import { isRecord } from "@/lib/utils";
import {
  Sparkles,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AiPortfolioAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investorName?: string;
  totalCurrentValue: number;
  totalInvested: number;
  holdings?: Array<{ name: string; currentValue: number; type?: string }>;
}

interface CasTransaction {
  date: string;
  schemeName: string;
  transactionType: string;
  amount: number | string;
}

interface CasExtraction {
  investor?: { pan?: string };
  summary?: { totalTransactions?: number };
  transactions?: CasTransaction[];
}

function parseCasExtraction(value: unknown): CasExtraction | null {
  if (!isRecord(value)) return null;

  const investor = isRecord(value.investor)
    ? { pan: typeof value.investor.pan === "string" ? value.investor.pan : undefined }
    : undefined;
  const summary = isRecord(value.summary)
    ? {
        totalTransactions:
          typeof value.summary.totalTransactions === "number"
            ? value.summary.totalTransactions
            : undefined,
      }
    : undefined;
  const transactions = Array.isArray(value.transactions)
    ? value.transactions.flatMap((item) => {
        if (
          !isRecord(item) ||
          typeof item.date !== "string" ||
          typeof item.schemeName !== "string" ||
          typeof item.transactionType !== "string" ||
          (typeof item.amount !== "number" && typeof item.amount !== "string")
        ) {
          return [];
        }
        return [{
          date: item.date,
          schemeName: item.schemeName,
          transactionType: item.transactionType,
          amount: item.amount,
        }];
      })
    : undefined;

  return { investor, summary, transactions };
}

export const AiPortfolioAuditDialog = ({
  open,
  onOpenChange,
  investorName = "Valued Investor",
  totalCurrentValue,
  totalInvested,
  holdings = [],
}: AiPortfolioAuditDialogProps) => {
  const [casText, setCasText] = useState("");
  const [extractedCas, setExtractedCas] = useState<CasExtraction | null>(null);
  const [extractError, setExtractError] = useState("");
  const [extracting, setExtracting] = useState(false);

  const totalGain = totalCurrentValue - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : "0.00";

  const handleExtractStatement = async () => {
    if (!casText.trim()) return;
    setExtracting(true);
    setExtractError("");
    setExtractedCas(null);

    try {
      const res = await fetch("/api/ai/document-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: casText, documentType: "CAS" }),
      });
      const payload: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const message = isRecord(payload) && typeof payload.error === "string"
          ? payload.error
          : `Document extraction failed (${res.status}).`;
        throw new Error(message);
      }
      const data = isRecord(payload) && "data" in payload ? payload.data : payload;
      const result = parseCasExtraction(data);
      if (!result) throw new Error("The document extraction service returned an invalid response.");
      setExtractedCas(result);
    } catch (error: unknown) {
      setExtractError(error instanceof Error ? error.message : "Unable to extract the statement.");
    } finally {
      setExtracting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-border shadow-2xl bg-card">
        {/* Header */}
        <div className="p-5 border-b border-border/70 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold font-heading">
                  AI Wealth Intelligence & Diagnostic
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Portfolio summary for {investorName}. Risk and tax metrics appear when supporting data is available.
                </DialogDescription>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              {holdings.length} holdings
            </Badge>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="p-5">
          <Tabs defaultValue="audit" className="w-full">
            <TabsList className="grid grid-cols-4 h-9 p-0.5 rounded-xl bg-muted/50 mb-4">
              <TabsTrigger value="audit" className="text-xs font-semibold rounded-lg">
                Health Audit
              </TabsTrigger>
              <TabsTrigger value="risk" className="text-xs font-semibold rounded-lg">
                Risk & VaR
              </TabsTrigger>
              <TabsTrigger value="tax" className="text-xs font-semibold rounded-lg">
                Tax Harvesting
              </TabsTrigger>
              <TabsTrigger value="extract" className="text-xs font-semibold rounded-lg">
                CAS Extractor
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Health Audit */}
            <TabsContent value="audit" className="space-y-4 m-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                  <p className="text-[11px] font-semibold text-muted-foreground">Portfolio Records</p>
                  <p className="text-lg font-bold text-foreground mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{holdings.length}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Mutual fund schemes in the selected portfolio</p>
                </Card>

                <Card className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                  <p className="text-[11px] font-semibold text-muted-foreground">Net Portfolio Gain</p>
                  <p className={cn("text-lg font-bold mt-1", totalGain >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                    {totalGain >= 0 ? "+" : ""}{formatIndianUnits(totalGain)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {totalInvested > 0 ? `${gainPct}% absolute return` : "Return unavailable without invested value"}
                  </p>
                </Card>

                <Card className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                  <p className="text-[11px] font-semibold text-muted-foreground">Current Portfolio Value</p>
                  <p className="text-lg font-bold text-foreground mt-1">{formatIndianUnits(totalCurrentValue)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Based on available transaction data</p>
                </Card>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-2.5">
                <p className="text-xs font-bold text-foreground">Holdings Summary</p>
                {holdings.length ? (
                  <div className="max-h-48 divide-y divide-border/40 overflow-y-auto text-xs">
                    {holdings.map((holding) => (
                      <div key={holding.name} className="flex items-center justify-between gap-3 py-2">
                        <span className="truncate text-foreground">{holding.name}</span>
                        <span className="shrink-0 font-semibold text-foreground">
                          {formatIndianUnits(holding.currentValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    No mutual fund holdings are available for this portfolio.
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Allocation and recommendations require holdings data across asset classes.
                </p>
              </div>
            </TabsContent>

            {/* Tab 2: Risk & VaR */}
            <TabsContent value="risk" className="space-y-3 m-0">
              <div className="p-4 rounded-xl border border-border/60 bg-card text-sm">
                <p className="font-semibold text-foreground">Risk metrics are not available</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Beta, volatility, Sharpe ratio, and value-at-risk require historical portfolio valuations and benchmark price data. They are not estimated from transaction totals alone.
                </p>
              </div>
            </TabsContent>

            {/* Tab 3: Tax Harvesting */}
            <TabsContent value="tax" className="space-y-3 m-0">
              <div className="p-4 rounded-xl border border-border/60 bg-card text-sm">
                <p className="font-semibold text-foreground">Tax analysis is not available</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tax outcomes depend on asset type, acquisition dates, realized gains, applicable exemptions, and the current financial year. No tax recommendation is generated without those details; consult a qualified tax professional.
                </p>
              </div>
            </TabsContent>

            {/* Tab 4: CAS Extractor */}
            <TabsContent value="extract" className="space-y-3 m-0">
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">Instant Statement / CAS Data Extractor</p>
                <p className="text-[11px] text-muted-foreground">
                  Paste raw text from a CAMS, KFintech, or NSDL CAS statement or contract note:
                </p>
                <textarea
                  value={casText}
                  onChange={(e) => setCasText(e.target.value)}
                  placeholder="Paste the text from a CAS statement or contract note"
                  className="w-full h-24 p-2.5 rounded-xl border border-border/70 bg-background text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  size="sm"
                  onClick={handleExtractStatement}
                  disabled={extracting || !casText.trim()}
                  className="gap-1.5 text-xs font-semibold rounded-xl"
                >
                  {extracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCheck2 className="h-3.5 w-3.5" />}
                  <span>{extracting ? "Extracting..." : "Parse Statement"}</span>
                </Button>
                {extractError && (
                  <p role="alert" className="text-xs text-destructive">{extractError}</p>
                )}
              </div>

              {extractedCas && (
                <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Extracted {extractedCas.summary?.totalTransactions || 0} Transactions
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      PAN: {extractedCas.investor?.pan || "—"}
                    </Badge>
                  </div>

                  <div className="max-h-32 overflow-y-auto divide-y divide-border/40 text-[11px]">
                    {extractedCas.transactions?.map((t, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">{t.schemeName}</p>
                          <p className="text-[10px] text-muted-foreground">{t.date} • {t.transactionType}</p>
                        </div>
                        <span className="font-extrabold text-foreground">₹{Number(t.amount).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/70 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>BrickWealth Phase 3 AI Intelligence Suite</span>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="rounded-xl h-8 text-xs">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
