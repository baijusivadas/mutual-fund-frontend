import { memo, useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import { formatIndianUnits } from "@/utils/format";
import { useInvestor } from "@/contexts/InvestorContext";
import { useUserInvestments } from "@/hooks/useUserInvestments";
import { isSellTransaction } from "@/utils/parseTransactions";
import { useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Scale,
  Sparkles,
  Clock,
} from "lucide-react";

/* ── KPI Card Component ──────────────────────────────────────── */
interface CgKpiCardProps {
  title: string;
  value: string;
  rateLabel: string;
  subText: string;
  icon: React.ReactNode;
  tag?: string;
  isPositive?: boolean;
}

const CgKpiCard = memo(
  ({ title, value, rateLabel, subText, icon, tag, isPositive = true }: CgKpiCardProps) => (
    <Card className="relative overflow-hidden bg-card border border-border/80 rounded-2xl shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200 group flex flex-col justify-between">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{title}</span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              {icon}
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-2.5 gap-2">
            <div>
              <p className="text-2xl font-heading font-extrabold text-foreground tracking-tight">{value}</p>
              <p className={cn("text-xs font-bold mt-0.5", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                {rateLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{subText}</span>
          {tag && (
            <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 rounded border-none bg-muted text-foreground">
              {tag}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
);
CgKpiCard.displayName = "CgKpiCard";

export const CapitalGains = () => {
  const { filteredTransactions, selectedInvestor } = useInvestor();
  const { isLoading: isTransactionsLoading, error: transactionsError } = useUserInvestments();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"stcg" | "ltcg">("stcg");

  const {
    stcgTrades,
    ltcgTrades,
    totalStcg,
    totalLtcg,
    stcgTax,
    ltcgTax,
    totalTaxLiability,
    unutilizedExemption,
  } = useMemo(() => {
    type Trade = {
      scheme: string;
      buyDate: string;
      sellDate: string;
      holdingDays: number;
      units: number;
      buyNav: number;
      sellNav: number;
      gain: number;
      isGain: boolean;
    };
    type PurchaseLot = { date: Date; unitsRemaining: number; nav: number };
    const orderedTransactions = [...filteredTransactions]
      .filter((tx) => tx.investmentDate && tx.schemeName?.trim())
      .map((tx) => ({ tx, date: new Date(tx.investmentDate) }))
      .filter(({ date }) => Number.isFinite(date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    const purchaseLots = new Map<string, PurchaseLot[]>();
    const stcgList: Trade[] = [];
    const ltcgList: Trade[] = [];
    let stcgSum = 0;
    let ltcgSum = 0;

    orderedTransactions.forEach(({ tx, date }) => {
      const scheme = tx.schemeName.trim();
      const units = Math.abs(Number(tx.units));
      const amount = Math.abs(Number(tx.value));
      const nav = Number(tx.nav);
      const unitPrice = nav > 0 ? nav : units > 0 ? amount / units : 0;
      if (!Number.isFinite(units) || units <= 0 || !Number.isFinite(unitPrice) || unitPrice <= 0) return;

      if (!isSellTransaction(tx)) {
        const lots = purchaseLots.get(scheme) ?? [];
        lots.push({ date, unitsRemaining: units, nav: unitPrice });
        purchaseLots.set(scheme, lots);
        return;
      }

      let unitsToMatch = units;
      const lots = purchaseLots.get(scheme) ?? [];
      for (const lot of lots) {
        if (unitsToMatch <= 0) break;
        if (lot.unitsRemaining <= 0) continue;

        const matchedUnits = Math.min(unitsToMatch, lot.unitsRemaining);
        const gain = matchedUnits * (unitPrice - lot.nav);
        const holdingDays = Math.max(0, Math.floor((date.getTime() - lot.date.getTime()) / 86_400_000));
        const tradeRecord: Trade = {
          scheme,
          buyDate: lot.date.toISOString().slice(0, 10),
          sellDate: date.toISOString().slice(0, 10),
          holdingDays,
          units: matchedUnits,
          buyNav: lot.nav,
          sellNav: unitPrice,
          gain: Math.round(gain),
          isGain: gain >= 0,
        };

        if (holdingDays > 365) {
          ltcgList.push(tradeRecord);
          ltcgSum += gain;
        } else {
          stcgList.push(tradeRecord);
          stcgSum += gain;
        }

        lot.unitsRemaining -= matchedUnits;
        unitsToMatch -= matchedUnits;
      }
    });

    const totalStcgValue = Math.round(stcgSum);
    const totalLtcgValue = Math.round(ltcgSum);
    const ltcgExemptionLimit = 125000;
    const taxableLtcg = Math.max(0, totalLtcgValue - ltcgExemptionLimit);
    const stTax = Math.round(Math.max(0, totalStcgValue) * 0.20);
    const ltTax = Math.round(taxableLtcg * 0.125);
    const unutilized = Math.max(0, ltcgExemptionLimit - Math.max(0, totalLtcgValue));

    return {
      stcgTrades: stcgList,
      ltcgTrades: ltcgList,
      totalStcg: totalStcgValue,
      totalLtcg: totalLtcgValue,
      stcgTax: stTax,
      ltcgTax: ltTax,
      totalTaxLiability: stTax + ltTax,
      unutilizedExemption: unutilized,
    };
  }, [filteredTransactions]);

  const exportSchedule = useCallback(() => {
    const headers = ["Term", "Scheme", "Buy date", "Sell date", "Holding days", "Units", "Buy NAV", "Sell NAV", "Realized gain"];
    const rows = [...stcgTrades.map((trade) => ({ ...trade, term: "STCG" })), ...ltcgTrades.map((trade) => ({ ...trade, term: "LTCG" }))]
      .map((trade) => [trade.term, trade.scheme, trade.buyDate, trade.sellDate, trade.holdingDays, trade.units, trade.buyNav, trade.sellNav, trade.gain]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `capital-gains-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [stcgTrades, ltcgTrades]);

  if (isTransactionsLoading || transactionsError) {
    return (
      <div className="space-y-5 animate-in">
        <PageHeader title="Capital Gains & Tax Estimate" description="FIFO-matched realized gains from recorded transactions. Tax figures are estimates and may depend on fund classification and your tax circumstances." />
        {isTransactionsLoading ? (
          <div role="status" className="rounded-xl border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">Loading transaction data…</div>
        ) : (
          <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>Capital gains data could not be loaded.</span>
            <Button variant="outline" onClick={() => void queryClient.invalidateQueries({ queryKey: ["user-investments"] })}>Retry</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Scale className="h-4 w-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-heading font-extrabold text-foreground">
              Capital Gains & Tax Estimate
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            FIFO-matched gains from available transaction history. Tax amounts are illustrative estimates, not a fiscal-year tax calculation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-muted/40">
            Client: {selectedInvestor === "all" ? "All Portfolios" : selectedInvestor}
          </Badge>
          <Badge className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
            Matched history
          </Badge>
        </div>
      </div>

      {/* ── Top 4 Modern KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <CgKpiCard
          title="Short-Term Gains (STCG)"
          value={formatIndianUnits(totalStcg)}
          rateLabel="Holding ≤ 12 Months"
          subText="Realized within 1 Year"
          icon={<Clock className="h-4 w-4" />}
          tag="STCG"
        />

        <CgKpiCard
          title="Long-Term Gains (LTCG)"
          value={formatIndianUnits(totalLtcg)}
          rateLabel="Holding > 12 Months"
          subText="Illustrative annual exemption assumption"
          icon={<TrendingUp className="h-4 w-4" />}
          tag="LTCG"
        />

        <CgKpiCard
          title="Estimated STCG Tax"
          value={formatIndianUnits(stcgTax)}
          rateLabel="20.0% Flat Rate"
          subText="No Exemption Available"
          icon={<DollarSign className="h-4 w-4" />}
          tag="Estimate"
          isPositive={false}
        />

        <CgKpiCard
          title="Estimated LTCG Tax"
          value={formatIndianUnits(ltcgTax)}
          rateLabel="12.5% on Excess"
          subText={`Combined estimate: ${formatIndianUnits(totalTaxLiability)}`}
          icon={<FileText className="h-4 w-4" />}
          tag="Estimate"
          isPositive={false}
        />
      </div>

      {/* ── Estimated exemption context ── */}
      <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-foreground">
              Illustrative LTCG exemption headroom:{" "}
              <span className="text-blue-600 font-extrabold">
                {unutilizedExemption > 0 ? `${formatIndianUnits(unutilizedExemption)} Unused LTCG Exemption` : "Exemption Exhausted"}
              </span>
            </p>
            <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">
              This estimate applies assumed annual rates and exemption limits to the matched history shown; it does not aggregate gains by financial year or account for all holdings, fund rules, costs, or individual tax circumstances. Verify with a tax professional before acting.
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-[11px] font-semibold text-muted-foreground">
          Estimate only · consult a tax professional
        </span>
      </div>

      {/* ── Tabs for Trades Ledger ── */}
      <Tabs
        defaultValue="stcg"
        value={activeTab}
        onValueChange={(value) => {
          if (value === "stcg" || value === "ltcg") setActiveTab(value);
        }}
        className="w-full space-y-4"
      >
        <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="stcg" className="text-xs font-semibold rounded-lg">
              Short-Term Tranches ({stcgTrades.length})
            </TabsTrigger>
            <TabsTrigger value="ltcg" className="text-xs font-semibold rounded-lg">
              Long-Term Tranches ({ltcgTrades.length})
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" onClick={exportSchedule} disabled={stcgTrades.length + ltcgTrades.length === 0} className="h-8 text-xs gap-1.5 rounded-xl border-border/70 hover:bg-muted">
            <Download className="h-3.5 w-3.5" />
            <span>Export Tax Schedule</span>
          </Button>
        </div>

        {/* Tab 1: STCG Tranches */}
        <TabsContent value="stcg" className="m-0 space-y-3">
          <Card className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border/60 text-[11px] font-bold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Scheme / Asset</th>
                    <th className="py-3 px-4">Buy Date</th>
                    <th className="py-3 px-4">Sell Date</th>
                    <th className="py-3 px-4 text-center">Holding Period</th>
                    <th className="py-3 px-4 text-right">Units</th>
                    <th className="py-3 px-4 text-right">Acquisition NAV</th>
                    <th className="py-3 px-4 text-right">Exit NAV</th>
                    <th className="py-3 px-4 text-right">Realized Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {stcgTrades.length > 0 ? stcgTrades.map((t, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">{t.scheme}</td>
                      <td className="py-3 px-4 text-muted-foreground">{t.buyDate}</td>
                      <td className="py-3 px-4 text-muted-foreground">{t.sellDate}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] font-medium bg-amber-500/10 text-amber-600 border-amber-500/20">
                          {t.holdingDays} Days
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{t.units.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">₹{t.buyNav.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold">₹{t.sellNav.toFixed(2)}</td>
                      <td className={cn("py-3 px-4 text-right font-extrabold", t.isGain ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                        {t.isGain ? "+" : ""}{formatIndianUnits(t.gain)}
                      </td>
                    </tr>
                  )) : <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No short-term gains can be matched from the available transaction records.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: LTCG Tranches */}
        <TabsContent value="ltcg" className="m-0 space-y-3">
          <Card className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border/60 text-[11px] font-bold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Scheme / Asset</th>
                    <th className="py-3 px-4">Buy Date</th>
                    <th className="py-3 px-4">Sell Date</th>
                    <th className="py-3 px-4 text-center">Holding Period</th>
                    <th className="py-3 px-4 text-right">Units</th>
                    <th className="py-3 px-4 text-right">Acquisition NAV</th>
                    <th className="py-3 px-4 text-right">Exit NAV</th>
                    <th className="py-3 px-4 text-right">Realized Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {ltcgTrades.length > 0 ? ltcgTrades.map((t, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">{t.scheme}</td>
                      <td className="py-3 px-4 text-muted-foreground">{t.buyDate}</td>
                      <td className="py-3 px-4 text-muted-foreground">{t.sellDate}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          {t.holdingDays} Days (LTCG)
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{t.units.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">₹{t.buyNav.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold">₹{t.sellNav.toFixed(2)}</td>
                      <td className={cn("py-3 px-4 text-right font-extrabold", t.isGain ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                        {t.isGain ? "+" : ""}{formatIndianUnits(t.gain)}
                      </td>
                    </tr>
                  )) : <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No long-term gains can be matched from the available transaction records.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default memo(CapitalGains);
