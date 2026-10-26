import { memo, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ShoppingCart,
  ArrowLeftRight,
  RotateCcw,
  MinusCircle,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  ChevronRight,
  Info,
  Building2,
  Layers,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────── */
type ExchangeType = "NSE" | "BSE" | "MFU";
type TransactionMode = "purchase" | "switch" | "redeem" | "sip" | "transfer";

interface OnlineTransaction {
  id: string;
  folio: string;
  investorName: string;
  schemeName: string;
  amcName: string;
  exchange: ExchangeType;
  mode: TransactionMode;
  amount: number;
  units?: number;
  nav?: number;
  status: "success" | "pending" | "failed" | "processing";
  submittedAt: string;
  reference: string;
}

/* ─── Mock Transactions ─────────────────────────────────────── */
const MOCK_TRANSACTIONS: OnlineTransaction[] = [
  {
    id: "1",
    folio: "12345678/90",
    investorName: "Abdul Rahim Mansuri",
    schemeName: "AXIS BLUECHIP FUND - REGULAR PLAN - GROWTH",
    amcName: "Axis Mutual Fund",
    exchange: "NSE",
    mode: "purchase",
    amount: 5000,
    units: 32.45,
    nav: 154.1,
    status: "success",
    submittedAt: "2026-05-01T10:15:00",
    reference: "NSE2026050100001",
  },
  {
    id: "2",
    folio: "87654321/12",
    investorName: "Priya Sharma",
    schemeName: "MIRAE ASSET LARGE CAP FUND - REGULAR - GROWTH",
    amcName: "Mirae Asset",
    exchange: "BSE",
    mode: "sip",
    amount: 3000,
    nav: 87.32,
    status: "processing",
    submittedAt: "2026-05-01T09:30:00",
    reference: "BSE2026050100012",
  },
  {
    id: "3",
    folio: "11223344/56",
    investorName: "Rajesh Kumar",
    schemeName: "NIPPON INDIA SMALL CAP FUND - GROWTH",
    amcName: "Nippon India",
    exchange: "MFU",
    mode: "redeem",
    amount: 15000,
    units: 210.5,
    nav: 71.25,
    status: "success",
    submittedAt: "2026-04-30T16:45:00",
    reference: "MFU2026043000099",
  },
  {
    id: "4",
    folio: "99887766/34",
    investorName: "Sunita Patel",
    schemeName: "HDFC BALANCED ADVANTAGE FUND - GROWTH",
    amcName: "HDFC Mutual Fund",
    exchange: "NSE",
    mode: "switch",
    amount: 25000,
    status: "pending",
    submittedAt: "2026-04-30T14:20:00",
    reference: "NSE2026043000045",
  },
  {
    id: "5",
    folio: "55667788/23",
    investorName: "Arjun Mehta",
    schemeName: "ICICI PRUDENTIAL TECHNOLOGY FUND - GROWTH",
    amcName: "ICICI Prudential",
    exchange: "BSE",
    mode: "purchase",
    amount: 10000,
    nav: 234.7,
    status: "failed",
    submittedAt: "2026-04-29T11:10:00",
    reference: "BSE2026042900078",
  },
  {
    id: "6",
    folio: "44556677/89",
    investorName: "Meera Nair",
    schemeName: "SBI BLUECHIP FUND - REGULAR PLAN - GROWTH",
    amcName: "SBI Mutual Fund",
    exchange: "NSE",
    mode: "sip",
    amount: 2000,
    status: "success",
    submittedAt: "2026-04-28T09:05:00",
    reference: "NSE2026042800133",
  },
];

const EXCHANGE_CONFIG: Record<ExchangeType, { color: string; bg: string }> = {
  NSE: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  BSE: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  MFU: { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10 border-violet-500/30" },
};

const MODE_CONFIG: Record<TransactionMode, { label: string; icon: React.ElementType; color: string }> = {
  purchase: { label: "Purchase", icon: ShoppingCart, color: "text-emerald-600 dark:text-emerald-400" },
  switch: { label: "Switch", icon: ArrowLeftRight, color: "text-blue-600 dark:text-blue-400" },
  redeem: { label: "Redeem", icon: MinusCircle, color: "text-rose-600 dark:text-rose-400" },
  sip: { label: "SIP", icon: Clock, color: "text-violet-600 dark:text-violet-400" },
  transfer: { label: "Transfer", icon: ArrowLeftRight, color: "text-amber-600 dark:text-amber-400" },
};

const STATUS_CONFIG = {
  success: { label: "Success", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/30" },
  processing: { label: "Processing", icon: RotateCcw, color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/30" },
  pending: { label: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30" },
  failed: { label: "Failed", icon: XCircle, color: "text-rose-600", bg: "bg-rose-500/10 border-rose-500/30" },
};

/* ─── Transaction Table Row ─────────────────────────────────── */
const TxnRow = memo(({ txn }: { txn: OnlineTransaction }) => {
  const exCfg = EXCHANGE_CONFIG[txn.exchange];
  const modeCfg = MODE_CONFIG[txn.mode];
  const statusCfg = STATUS_CONFIG[txn.status];
  const ModeIcon = modeCfg.icon;
  const StatusIcon = statusCfg.icon;

  const submittedDate = useMemo(() => {
    try {
      const d = new Date(txn.submittedAt);
      return `${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
    } catch { return txn.submittedAt; }
  }, [txn.submittedAt]);

  return (
    <div className="grid grid-cols-12 items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-sm transition-all text-xs">
      {/* Exchange badge */}
      <div className="col-span-1">
        <Badge variant="outline" className={cn("text-[10px] font-bold rounded px-1.5 py-0", exCfg.bg, exCfg.color)}>
          {txn.exchange}
        </Badge>
      </div>

      {/* Investor + Scheme */}
      <div className="col-span-4">
        <p className="font-bold text-foreground truncate">{txn.investorName}</p>
        <p className="text-[11px] text-blue-600 dark:text-blue-400 truncate">{txn.schemeName}</p>
        <p className="text-[10px] text-muted-foreground">{txn.amcName} · Folio: {txn.folio}</p>
      </div>

      {/* Mode */}
      <div className="col-span-2 flex items-center gap-1">
        <ModeIcon className={cn("h-3.5 w-3.5 shrink-0", modeCfg.color)} />
        <span className={cn("font-semibold", modeCfg.color)}>{modeCfg.label}</span>
      </div>

      {/* Amount */}
      <div className="col-span-2 font-bold text-foreground text-right">
        <p>₹{txn.amount.toLocaleString("en-IN")}</p>
        {txn.nav && <p className="text-[10px] text-muted-foreground font-normal">NAV: ₹{txn.nav}</p>}
      </div>

      {/* Date */}
      <div className="col-span-2 text-muted-foreground text-right">
        <p>{submittedDate}</p>
        <p className="text-[10px]">{txn.reference}</p>
      </div>

      {/* Status */}
      <div className="col-span-1 flex justify-end">
        <Badge variant="outline" className={cn("text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0 rounded border", statusCfg.bg, statusCfg.color)}>
          <StatusIcon className="h-2.5 w-2.5" />
          {statusCfg.label}
        </Badge>
      </div>
    </div>
  );
});

/* ─── New Transaction Form (Quick Actions) ──────────────────── */
const QuickActionCard = memo(({ icon: Icon, title, desc, color, onClick }: {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-md transition-all text-left group"
  >
    <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", color)}>
      <Icon className="h-4.5 w-4.5" />
    </div>
    <div>
      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{title}</p>
      <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors self-end" />
  </button>
));

/* ─── Online Transactions Page ──────────────────────────────── */
const OnlineTransactions = () => {
  const [search, setSearch] = useState("");
  const [exchangeFilter, setExchangeFilter] = useState<"all" | ExchangeType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | OnlineTransaction["status"]>("all");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    let list = MOCK_TRANSACTIONS;
    if (exchangeFilter !== "all") list = list.filter((t) => t.exchange === exchangeFilter);
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.investorName.toLowerCase().includes(q) ||
          t.schemeName.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, exchangeFilter, statusFilter]);

  const summary = useMemo(() => {
    const total = MOCK_TRANSACTIONS.length;
    const success = MOCK_TRANSACTIONS.filter((t) => t.status === "success").length;
    const pending = MOCK_TRANSACTIONS.filter((t) => t.status === "pending" || t.status === "processing").length;
    const failed = MOCK_TRANSACTIONS.filter((t) => t.status === "failed").length;
    const totalAmount = MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
    return { total, success, pending, failed, totalAmount };
  }, []);

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-heading font-extrabold text-foreground">Online Transactions</h1>
            <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 rounded-full font-bold">NSE · BSE · MFU</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage NSE, BSE, and MFU transactions from one platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="h-8 text-xs rounded-lg gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { icon: ShoppingCart, title: "Purchase", desc: "Buy mutual fund units", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
          { icon: ArrowLeftRight, title: "Switch", desc: "Switch between funds", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
          { icon: RotateCcw, title: "Transfer", desc: "Transfer folio units", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
          { icon: MinusCircle, title: "Redeem", desc: "Withdraw investment", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
          { icon: Clock, title: "SIP", desc: "Start/modify SIP", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
        ].map((action) => (
          <QuickActionCard
            key={action.title}
            icon={action.icon}
            title={action.title}
            desc={action.desc}
            color={action.color}
            onClick={() => setShowForm(true)}
          />
        ))}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Transactions", value: summary.total, color: "text-foreground", icon: FileText },
          { label: "Successful", value: summary.success, color: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
          { label: "Pending / Processing", value: summary.pending, color: "text-amber-600 dark:text-amber-400", icon: Clock },
          { label: "Failed", value: summary.failed, color: "text-rose-600 dark:text-rose-400", icon: XCircle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border border-border/70 rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={cn("h-6 w-6 shrink-0", item.color)} />
                <div>
                  <p className={cn("text-2xl font-heading font-extrabold", item.color)}>{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Exchange Platform Selector */}
      <Card className="border border-border/70 rounded-xl">
        <CardHeader className="p-4 pb-3 border-b border-border/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-bold">Transaction History</CardTitle>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search investor, scheme..."
                  className="pl-8 h-8 text-xs w-52 rounded-lg"
                />
              </div>

              {/* Exchange filter */}
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
                {(["all", "NSE", "BSE", "MFU"] as const).map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setExchangeFilter(ex)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all",
                      exchangeFilter === ex
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {ex === "all" ? "All" : ex}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
                {(["all", "success", "pending", "failed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-all",
                      statusFilter === s
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column Headers */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 pt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-1">Exchange</div>
            <div className="col-span-4">Investor / Scheme</div>
            <div className="col-span-2">Mode</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Submitted</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
        </CardHeader>

        <CardContent className="p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Filter className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="font-bold text-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground">Try different filters or search terms</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setExchangeFilter("all"); setStatusFilter("all"); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            filtered.map((txn) => <TxnRow key={txn.id} txn={txn} />)
          )}
        </CardContent>
      </Card>

      {/* Info Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Building2, title: "NSE StarMF", desc: "Purchase, switch, transfer, redeem via NSE", color: "text-blue-600 bg-blue-500/10" },
          { icon: Layers, title: "BSE StAR MF", desc: "Bulk transactions in a few steps on BSE", color: "text-amber-600 bg-amber-500/10" },
          { icon: Globe, title: "MFU Platform", desc: "View and choose from top AMC options on MFU", color: "text-violet-600 bg-violet-500/10" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-card">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", item.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineTransactions;
