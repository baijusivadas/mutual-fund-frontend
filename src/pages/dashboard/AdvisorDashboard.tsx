import { memo, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvestor } from "@/contexts/InvestorContext";
import { useAuth } from "@/contexts/AuthContext";
import { isSellTransaction } from "@/utils/parseTransactions";
import { formatIndianUnits, formatRelativeDate } from "@/utils/format";
import {
  classifyScheme,
  extractAMC,
  getClientRiskProfile,
  getClientTier,
  AMC_COLOR_PALETTE,
} from "@/utils/schemeUtils";
import { cn } from "@/lib/utils";
import type {
  ClientRow,
  AdvisorySignal,
  AmcShare,
  CapShare,
  MonthlyFlow,
  SchemePerformance,
  AdvisorMetrics,
} from "@/types/advisor";
import {
  Users,
  Briefcase,
  CircleAlert,
  Wallet,
  Clock3,
  Eye,
  Building2,
} from "lucide-react";

import { AdvisorKpis } from "@/components/advisor/AdvisorKpis";
import { AdvisoryCockpit } from "@/components/advisor/AdvisoryCockpit";
import { CashflowSection } from "@/components/advisor/CashflowSection";
import { AmcMarketShare } from "@/components/advisor/AmcMarketShare";
import { ClientBookTable } from "@/components/advisor/ClientBookTable";
import { SchemeHoldingsTable } from "@/components/advisor/SchemeHoldingsTable";
import { PerformanceMatrix } from "@/components/advisor/PerformanceMatrix";

/* ═══════════════════════════════════════════════════════════════════
   ADVISOR DASHBOARD
   ═══════════════════════════════════════════════════════════════════ */

export const AdvisorDashboard = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions, setSelectedInvestor, isLoading, investmentsError } = useInvestor();

  const advisorName = user?.name?.trim() || user?.email?.split("@")[0] || "Advisor";
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  }, []);

  /* ═══ Build client list from transactions ════════════════════ */
  const clientList: ClientRow[] = useMemo(() => {
    const map = new Map<
      string,
      {
        schemes: Map<string, { units: number; nav: number; latestDate: number; invested: number; name: string }>;
        txCount: number;
        latestActivity: string | null;
        sipCount: number;
      }
    >();

    for (const tx of transactions) {
      const name = tx.investorName?.trim();
      if (!name) continue;
      if (!map.has(name)) map.set(name, { schemes: new Map(), txCount: 0, latestActivity: null, sipCount: 0 });
      const rec = map.get(name)!;
      const sell = isSellTransaction(tx);
      rec.txCount++;
      if (/sip/i.test(tx.transactionType)) rec.sipCount++;

      const d = tx.investmentDate ? new Date(tx.investmentDate) : null;
      const ts = d && !Number.isNaN(d.getTime()) ? d.getTime() : -Infinity;
      if (ts > -Infinity && (!rec.latestActivity || ts > new Date(rec.latestActivity).getTime())) {
        rec.latestActivity = d!.toISOString();
      }

      if (tx.schemeName) {
        const cur = rec.schemes.get(tx.schemeName) || {
          units: 0,
          nav: 0,
          latestDate: -Infinity,
          invested: 0,
          name: tx.schemeName,
        };
        cur.units += sell ? -tx.units : tx.units;
        cur.invested += sell ? -tx.value : tx.value;
        if (tx.nav > 0 && ts >= cur.latestDate) {
          cur.nav = tx.nav;
          cur.latestDate = ts;
        }
        rec.schemes.set(tx.schemeName, cur);
      }
    }

    return Array.from(map.entries()).map(([name, data]) => {
      let cv = 0,
        uv = 0,
        eq = 0,
        de = 0,
        hy = 0,
        inv = 0;
      data.schemes.forEach((s) => {
        inv += s.invested;
        if (s.units > 0) {
          if (s.nav > 0) {
            const v = s.units * s.nav;
            cv += v;
            const t = classifyScheme(s.name);
            if (t === "equity") eq += v;
            else if (t === "debt") de += v;
            else hy += v;
          } else uv++;
        }
      });
      const tot = eq + de + hy || 1;
      const ret = cv - inv;
      const equityPct = Math.round((eq / tot) * 100);
      const isDormant = data.latestActivity
        ? Date.now() - new Date(data.latestActivity).getTime() > 180 * 86_400_000
        : false;

      return {
        id: name,
        name,
        schemesCount: data.schemes.size,
        unvaluedSchemesCount: uv,
        transactionCount: data.txCount,
        netInvested: inv,
        currentValue: cv,
        returns: ret,
        returnsPercent: inv > 0 ? (ret / inv) * 100 : null,
        latestActivity: data.latestActivity,
        sipCount: data.sipCount,
        equityPct,
        debtPct: Math.round((de / tot) * 100),
        hybridPct: Math.round((hy / tot) * 100),
        tier: getClientTier(cv),
        riskProfile: getClientRiskProfile(equityPct),
        isDormant,
      };
    });
  }, [transactions]);

  /* ═══ Aggregate metrics ══════════════════════════════════════ */
  const metrics: AdvisorMetrics = useMemo(() => {
    const practiceAum = clientList.reduce((s, c) => s + c.currentValue, 0);
    const netInvested = clientList.reduce((s, c) => s + c.netInvested, 0);
    const totalReturns = practiceAum - netInvested;
    const totalSipCount = clientList.reduce((s, c) => s + c.sipCount, 0);
    const hniClients = clientList.filter((c) => c.tier === "HNI").length;
    const premiumClients = clientList.filter((c) => c.tier === "Premium").length;
    const regularClients = clientList.filter((c) => c.tier === "Regular").length;

    const now = new Date();
    const latestTx = transactions.reduce<Date | null>((lat, tx) => {
      if (!tx.investmentDate) return lat;
      const d = new Date(tx.investmentDate);
      return Number.isNaN(d.getTime()) ? lat : !lat || d > lat ? d : lat;
    }, null);
    const periodEnd = latestTx || now;
    const mfMap = new Map<string, MonthlyFlow>();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(periodEnd.getFullYear(), periodEnd.getMonth() - i, 1);
      mfMap.set(`${m.getFullYear()}-${m.getMonth()}`, {
        label: m.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        purchases: 0,
        redemptions: 0,
        netFlow: 0,
        transactions: 0,
      });
    }

    let lastActivity: string | null = null;
    let latestTs = -Infinity;
    const curMK = `${now.getFullYear()}-${now.getMonth()}`;
    let mPurch = 0,
      mRed = 0;

    for (const tx of transactions) {
      const d = tx.investmentDate ? new Date(tx.investmentDate) : null;
      if (!d || Number.isNaN(d.getTime())) continue;
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const mf = mfMap.get(k);
      const sell = isSellTransaction(tx);
      if (mf) {
        if (sell) mf.redemptions += tx.value;
        else mf.purchases += tx.value;
        mf.netFlow = mf.purchases - mf.redemptions;
        mf.transactions++;
      }
      if (k === curMK) {
        if (sell) mRed += tx.value;
        else mPurch += tx.value;
      }
      if (d.getTime() > latestTs) {
        latestTs = d.getTime();
        lastActivity = d.toISOString();
      }
    }

    const monthlyFlows = Array.from(mfMap.values());

    // Scheme-level aggregation for top/bottom funds & AMCs
    const sAgg = new Map<string, { invested: number; clients: Set<string> }>();
    const sUnits = new Map<string, { units: number; nav: number }>();
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.investmentDate).getTime() - new Date(b.investmentDate).getTime()
    );
    for (const tx of sorted) {
      if (!tx.schemeName) continue;
      const inv = tx.investorName?.trim();
      if (inv) {
        if (!sAgg.has(tx.schemeName)) sAgg.set(tx.schemeName, { invested: 0, clients: new Set() });
        const a = sAgg.get(tx.schemeName)!;
        a.invested += isSellTransaction(tx) ? -tx.value : tx.value;
        a.clients.add(inv);
      }
      const u = sUnits.get(tx.schemeName) || { units: 0, nav: 0 };
      u.units += isSellTransaction(tx) ? -tx.units : tx.units;
      if (tx.nav > 0) u.nav = tx.nav;
      sUnits.set(tx.schemeName, u);
    }

    const allFunds: SchemePerformance[] = [];
    const amcMap = new Map<string, { value: number; schemes: Set<string>; clients: Set<string> }>();
    let largeCapVal = 0,
      midSmallVal = 0,
      flexiVal = 0,
      debtCashVal = 0,
      hybridVal = 0;

    sAgg.forEach((data, name) => {
      const su = sUnits.get(name);
      if (!su || su.units <= 0) return;
      const v = su.units * su.nav;
      const type = classifyScheme(name);
      const amc = extractAMC(name);
      allFunds.push({
        schemeName: name,
        totalValue: v,
        totalInvested: data.invested,
        returnsPercent: data.invested > 0 ? ((v - data.invested) / data.invested) * 100 : 0,
        clientCount: data.clients.size,
        type,
        amc,
      });

      // AMC aggregation
      if (!amcMap.has(amc)) amcMap.set(amc, { value: 0, schemes: new Set(), clients: new Set() });
      const item = amcMap.get(amc)!;
      item.value += v;
      item.schemes.add(name);
      data.clients.forEach((c) => item.clients.add(c));

      // Style classification
      const l = name.toLowerCase();
      if (type === "debt") debtCashVal += v;
      else if (type === "hybrid") hybridVal += v;
      else if (l.includes("large") || l.includes("bluechip") || l.includes("top 100") || l.includes("nifty 50"))
        largeCapVal += v;
      else if (l.includes("mid") || l.includes("small") || l.includes("micro") || l.includes("emerging"))
        midSmallVal += v;
      else flexiVal += v;
    });
    allFunds.sort((a, b) => b.returnsPercent - a.returnsPercent);

    const amcBreakdown: AmcShare[] = Array.from(amcMap.entries())
      .map(([amc, d], idx) => ({
        amc,
        totalValue: d.value,
        pct: practiceAum > 0 ? Math.round((d.value / practiceAum) * 100) : 0,
        clientCount: d.clients.size,
        schemeCount: d.schemes.size,
        color:
          AMC_COLOR_PALETTE[amc] ||
          ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#db2777"][idx % 7],
      }))
      .sort((a, b) => b.totalValue - a.totalValue);

    const marketCapBreakdown: CapShare[] = [
      {
        category: "Large Cap",
        totalValue: largeCapVal,
        pct: practiceAum > 0 ? Math.round((largeCapVal / practiceAum) * 100) : 0,
        color: "#3b82f6",
        description: "Bluechip & Top 100 market leaders",
      },
      {
        category: "Flexi & Multi Cap",
        totalValue: flexiVal,
        pct: practiceAum > 0 ? Math.round((flexiVal / practiceAum) * 100) : 0,
        color: "#6366f1",
        description: "Multi-cap dynamic asset allocation",
      },
      {
        category: "Mid & Small Cap",
        totalValue: midSmallVal,
        pct: practiceAum > 0 ? Math.round((midSmallVal / practiceAum) * 100) : 0,
        color: "#8b5cf6",
        description: "High-growth mid & emerging businesses",
      },
      {
        category: "Hybrid & Multi-Asset",
        totalValue: hybridVal,
        pct: practiceAum > 0 ? Math.round((hybridVal / practiceAum) * 100) : 0,
        color: "#10b981",
        description: "Balanced asset allocation",
      },
      {
        category: "Debt & Liquid",
        totalValue: debtCashVal,
        pct: practiceAum > 0 ? Math.round((debtCashVal / practiceAum) * 100) : 0,
        color: "#f59e0b",
        description: "Fixed income & capital preservation",
      },
    ].filter((c) => c.totalValue > 0);

    // Advisory Signals
    const advisorySignals: AdvisorySignal[] = [];
    clientList.forEach((c) => {
      if (c.equityPct >= 90 && c.currentValue >= 100000) {
        advisorySignals.push({
          id: `drift-${c.id}`,
          type: "rebalance",
          category: "Risk & Allocation",
          severity: "high",
          clientName: c.name,
          title: "Equity Skew (>90%)",
          detail: `${c.name}'s portfolio is ${c.equityPct}% in Equity (${formatIndianUnits(c.currentValue)}). Consider diversifying into Debt or Arbitrage to lock in gains.`,
          metricLabel: "Equity Mix",
          metricValue: `${c.equityPct}%`,
          actionText: "Rebalance",
        });
      } else if (c.equityPct <= 25 && c.currentValue >= 100000) {
        advisorySignals.push({
          id: `drag-${c.id}`,
          type: "rebalance",
          category: "Risk & Allocation",
          severity: "medium",
          clientName: c.name,
          title: "High Cash / Debt Drag (<25% Equity)",
          detail: `Only ${c.equityPct}% in growth assets. Portfolio may underperform inflation over multi-year horizons.`,
          metricLabel: "Equity Mix",
          metricValue: `${c.equityPct}%`,
          actionText: "Deploy Equity",
        });
      }

      if (c.returns >= 50000 && c.equityPct >= 50) {
        const harvestable = Math.min(125000, Math.max(0, c.returns));
        advisorySignals.push({
          id: `tax-${c.id}`,
          type: "tax_harvest",
          category: "Tax Optimization",
          severity: "medium",
          clientName: c.name,
          title: "Annual Tax Harvesting Window",
          detail: `Gains of ${formatIndianUnits(c.returns)}. Consider booking up to ${formatIndianUnits(harvestable)} under section 112A annual exemption and reinvesting.`,
          metricLabel: "Unrealized Gain",
          metricValue: formatIndianUnits(c.returns),
          actionText: "Tax Harvest",
        });
      }

      if (c.isDormant) {
        advisorySignals.push({
          id: `dormant-${c.id}`,
          type: "dormancy",
          category: "Client Engagement",
          severity: "medium",
          clientName: c.name,
          title: "Dormant Client Review Needed",
          detail: `No transaction activity in over 6 months (${formatRelativeDate(c.latestActivity)}). Schedule a portfolio performance check-in.`,
          metricLabel: "Last Active",
          metricValue: formatRelativeDate(c.latestActivity),
          actionText: "Reach Out",
        });
      }

      if (c.sipCount === 0 && c.currentValue >= 200000) {
        advisorySignals.push({
          id: `sip-${c.id}`,
          type: "sip_potential",
          category: "Wealth Velocity",
          severity: "info",
          clientName: c.name,
          title: "No Active SIP Registered",
          detail: `High portfolio value of ${formatIndianUnits(c.currentValue)} with 0 active systematic plans. Set up recurring compounding.`,
          metricLabel: "Active SIPs",
          metricValue: "0",
          actionText: "Start SIP",
        });
      }
    });

    const sortedClients = [...clientList].sort((a, b) => b.currentValue - a.currentValue);
    const top1Concentration =
      practiceAum > 0 && sortedClients[0] ? Math.round((sortedClients[0].currentValue / practiceAum) * 100) : 0;
    const top3Concentration =
      practiceAum > 0
        ? Math.round((sortedClients.slice(0, 3).reduce((s, c) => s + c.currentValue, 0) / practiceAum) * 100)
        : 0;
    const avgClientAum = clientList.length > 0 ? practiceAum / clientList.length : 0;

    let totalEquity = 0,
      totalDebt = 0,
      totalHybrid = 0;
    clientList.forEach((c) => {
      totalEquity += (c.equityPct * c.currentValue) / 100;
      totalDebt += (c.debtPct * c.currentValue) / 100;
      totalHybrid += (c.hybridPct * c.currentValue) / 100;
    });

    const totalInflow6M = monthlyFlows.reduce((s, m) => s + m.purchases, 0);
    const totalOutflow6M = monthlyFlows.reduce((s, m) => s + m.redemptions, 0);
    const netCashflow6M = totalInflow6M - totalOutflow6M;
    const flowRetentionRate =
      totalInflow6M > 0 ? Math.round(((totalInflow6M - totalOutflow6M) / totalInflow6M) * 100) : 0;

    return {
      practiceAum,
      netInvested,
      totalReturns,
      totalSipCount,
      hniClients,
      premiumClients,
      regularClients,
      monthlyFlows,
      totalInflow6M,
      totalOutflow6M,
      netCashflow6M,
      flowRetentionRate,
      aumSparkline: monthlyFlows.map((m) => m.netFlow),
      purchaseSparkline: monthlyFlows.map((m) => m.purchases),
      lastActivity,
      monthlyPurchaseTotal: mPurch,
      monthlyRedemptionTotal: mRed,
      allFunds,
      topFunds: allFunds.filter((f) => f.returnsPercent > 0).slice(0, 5),
      bottomFunds: allFunds
        .filter((f) => f.returnsPercent < 0)
        .sort((a, b) => a.returnsPercent - b.returnsPercent)
        .slice(0, 5),
      totalEquity,
      totalDebt,
      totalHybrid,
      schemeCount: new Set(transactions.map((t) => t.schemeName).filter(Boolean)).size,
      unassignedCount: transactions.filter((t) => !t.investorName?.trim()).length,
      amcBreakdown,
      marketCapBreakdown,
      advisorySignals,
      top1Concentration,
      top3Concentration,
      avgClientAum,
    };
  }, [clientList, transactions]);

  /* ═══ Recent transactions stream ═════════════════════════════ */
  const recentTxs = useMemo(
    () =>
      [...transactions]
        .filter((t) => t.investmentDate && !Number.isNaN(new Date(t.investmentDate).getTime()))
        .sort((a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime())
        .slice(0, 6)
        .map((t) => ({ ...t, clientName: t.investorName?.trim() || "" })),
    [transactions]
  );

  const handleSelectClient = useCallback(
    (name: string) => {
      setSelectedInvestor(name);
      navigate("/client-view");
    },
    [setSelectedInvestor, navigate]
  );

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-5 animate-in">
      {/* ─── HERO BANNER ───────────────────────────────────────── */}
      <header className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-7 text-white shadow-glass">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-0 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-sm">
                <Building2 className="h-7 w-7 text-blue-300" />
              </div>
              <div>
                <p className="text-[11px] font-medium tracking-wide text-blue-300/90 uppercase">{greeting}</p>
                <h1 className="text-2xl font-heading font-bold tracking-tight lg:text-[28px]">{advisorName}</h1>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[.07] px-3 py-1.5 text-[11px] font-medium text-white/90 ring-1 ring-white/10 backdrop-blur-sm">
                <Users className="h-3.5 w-3.5 text-blue-300" /> {clientList.length} Clients
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[.07] px-3 py-1.5 text-[11px] font-medium text-white/90 ring-1 ring-white/10 backdrop-blur-sm">
                <Briefcase className="h-3.5 w-3.5 text-emerald-300" /> AUM {formatIndianUnits(metrics.practiceAum)}
              </span>
              {metrics.lastActivity && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[.07] px-3 py-1.5 text-[11px] font-medium text-white/70 ring-1 ring-white/10 backdrop-blur-sm">
                  <Clock3 className="h-3.5 w-3.5" /> Last activity: {formatRelativeDate(metrics.lastActivity)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              onClick={() => {
                setSelectedInvestor("all");
                navigate("/client-view");
              }}
              className="h-10 gap-2 bg-white px-4 text-xs font-bold text-slate-900 shadow-md hover:bg-blue-50 transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-blue-600" /> Client View
            </Button>
          </div>
        </div>
      </header>

      {/* ─── ERROR STATE ───────────────────────────────────────── */}
      {investmentsError && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-foreground">Client investment data could not be loaded.</p>
            <p className="mt-1 text-muted-foreground">{investmentsError instanceof Error ? investmentsError.message : "Please try again later."}</p>
          </div>
        </div>
      )}

      {/* ─── LOADING STATE ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-border/50 bg-muted/30" />
          ))}
        </div>
      ) : investmentsError ? null : transactions.length === 0 ? (
        /* ─── EMPTY STATE ────────────────────────────────────── */
        <Card className="rounded-2xl border-dashed border-2 shadow-sm">
          <CardContent className="flex flex-col items-center px-8 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-glow/20">
              <Wallet className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-heading font-bold text-foreground">Welcome to BrickWealth Advisor</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Once transactions and investor accounts are loaded, your practice AUM, client portfolios,
              and live performance analytics will automatically appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ═══ STICKY QUICK-JUMP NAVIGATION ═════════════════════ */}
          <nav className="sticky top-16 z-30 flex items-center gap-2 overflow-x-auto rounded-2xl border border-border/60 bg-background/95 p-1.5 shadow-sm backdrop-blur-xl">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-2 pr-1 shrink-0">
              Command Center:
            </span>
            {[
              { id: "kpis-section", label: "📊 Practice KPIs" },
              { id: "cockpit-section", label: `⚡ Advisory Cockpit (${metrics.advisorySignals.length})`, highlight: metrics.advisorySignals.length > 0 },
              { id: "cashflow-section", label: "📈 Cashflow & Allocation" },
              { id: "amc-section", label: "🏛️ AMC & Asset Mix" },
              { id: "clients-section", label: `👥 Client Book (${clientList.length})` },
              { id: "funds-section", label: `📋 Scheme Holdings (${metrics.schemeCount})` },
              { id: "performers-section", label: "🏆 Performance Matrix" },
            ].map((anchor) => (
              <button
                key={anchor.id}
                onClick={() => {
                  const el = document.getElementById(anchor.id);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer",
                  anchor.highlight
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/25"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted ring-1 ring-border/30"
                )}
              >
                {anchor.label}
              </button>
            ))}
          </nav>

          {/* ═══ SECTION 1: KPIS & VELOCITY ═══════════════════════ */}
          <AdvisorKpis metrics={metrics} clientList={clientList} />

          {/* ═══ SECTION 2: ADVISORY COCKPIT ══════════════════════ */}
          <AdvisoryCockpit signals={metrics.advisorySignals} onSelectClient={handleSelectClient} />

          {/* ═══ SECTION 3: CASHFLOW & ASSET ALLOCATION ═══════════ */}
          <CashflowSection metrics={metrics} />

          {/* ═══ SECTION 4: AMC & MARKET CAP DISTRIBUTION ═════════ */}
          <AmcMarketShare
            amcBreakdown={metrics.amcBreakdown}
            marketCapBreakdown={metrics.marketCapBreakdown}
          />

          {/* ═══ SECTION 5: COMPLETE CLIENT BOOK ══════════════════ */}
          <ClientBookTable clientList={clientList} onSelectClient={handleSelectClient} />

          {/* ═══ SECTION 6: SCHEME HOLDINGS & FUND ANALYSIS ═══════ */}
          <SchemeHoldingsTable funds={metrics.allFunds} />

          {/* ═══ SECTION 7: PERFORMANCE MATRIX & TRADE STREAMS ════ */}
          <PerformanceMatrix
            topFunds={metrics.topFunds}
            bottomFunds={metrics.bottomFunds}
            recentTxs={recentTxs}
          />

          {/* ─── FOOTNOTE ───────────────────────────────────────── */}
          <p className="text-center text-[10px] leading-5 text-muted-foreground/60">
            Portfolio values are based on the latest NAV recorded in transaction history and may differ from live market valuations.
            Data is derived from imported CAS/transaction files.
          </p>
        </>
      )}
    </div>
  );
});

AdvisorDashboard.displayName = "AdvisorDashboard";

export default AdvisorDashboard;
