import { memo, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdvancedPortfolio } from "@/hooks/useAdvancedPortfolio";
import { useQueryClient } from "@tanstack/react-query";
import { formatIndianUnits } from "@/utils/format";
import { Activity, AlertCircle, Layers, Search, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type PortfolioRecord = Record<string, string | number | null | undefined>;

interface EtfHolding {
  key: string;
  name: string;
  symbol: string;
  quantity: number;
  currentNav: number | null;
  purchaseNav: number | null;
}

const numericValue = (value: PortfolioRecord[string]) => {
  const parsed = Number(value);
  return value !== null && value !== undefined && value !== "" && Number.isFinite(parsed) ? parsed : null;
};

const StockReports = () => {
  const { raw, isLoading, error } = useAdvancedPortfolio();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedHoldingKey, setSelectedHoldingKey] = useState("");

  const holdings = useMemo(() => {
    const records = (raw.etfs || []) as PortfolioRecord[];
    return records.flatMap((record, index) => {
      const name = String(record.asset_name || record.name || record.symbol || "").trim();
      const symbol = String(record.symbol || "").trim();
      const quantity = numericValue(record.quantity);
      if (!name || quantity === null || quantity <= 0) return [];

      return [{
        key: String(record.id || symbol || `${name}-${index}`),
        name,
        symbol,
        quantity,
        currentNav: numericValue(record.current_nav),
        purchaseNav: numericValue(record.purchase_price ?? record.average_price),
      }];
    });
  }, [raw]);

  const filteredHoldings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? holdings.filter((holding) => `${holding.name} ${holding.symbol}`.toLowerCase().includes(query))
      : holdings;
  }, [holdings, search]);

  const selectedHolding = filteredHoldings.find((holding) => holding.key === selectedHoldingKey) || filteredHoldings[0];
  const marketValue = holdings.reduce(
    (total, holding) => total + (holding.currentNav === null ? 0 : holding.quantity * holding.currentNav),
    0
  );
  const investedValue = holdings.reduce(
    (total, holding) => total + (holding.purchaseNav === null ? 0 : holding.quantity * holding.purchaseNav),
    0
  );
  const comparableHoldings = holdings.filter(
    (holding) => holding.currentNav !== null && holding.purchaseNav !== null
  );
  const comparableValue = comparableHoldings.reduce(
    (total, holding) => total + holding.quantity * (holding.currentNav! - holding.purchaseNav!),
    0
  );
  const comparableCost = comparableHoldings.reduce(
    (total, holding) => total + holding.quantity * holding.purchaseNav!,
    0
  );
  const returnPercent = comparableCost > 0 ? (comparableValue / comparableCost) * 100 : null;
  const marketValueCount = holdings.filter((holding) => holding.currentNav !== null).length;
  const purchaseValueCount = holdings.filter((holding) => holding.purchaseNav !== null).length;
  const selectedValue = selectedHolding?.currentNav === null || !selectedHolding
    ? null
    : selectedHolding.quantity * selectedHolding.currentNav;
  const selectedCost = selectedHolding?.purchaseNav === null || !selectedHolding
    ? null
    : selectedHolding.quantity * selectedHolding.purchaseNav;
  const selectedGain = selectedValue === null || selectedCost === null ? null : selectedValue - selectedCost;

  if (isLoading) {
    return (
      <div className="space-y-5 animate-in" role="status" aria-live="polite">
        <PageHeader title="Equity & ETF Reports" description="Review holdings and recorded valuation data." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <Card key={index} className="h-32 animate-pulse border-border/70 bg-muted/30" />)}
        </div>
        <p className="text-sm text-muted-foreground">Loading holdings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5 animate-in">
        <PageHeader title="Equity & ETF Reports" description="Review holdings and recorded valuation data." />
        <Card className="rounded-2xl border border-destructive/30">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Holdings could not be loaded. Please try again.</p>
            <Button variant="outline" onClick={() => void queryClient.invalidateQueries({ queryKey: ["consolidated-portfolio"] })}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title="Equity & ETF Reports"
        description="A clear view of ETF positions and the valuation and purchase prices recorded in your portfolio."
        actions={<Badge variant="outline" className="w-fit rounded-lg px-3 py-1.5">{holdings.length} recorded holdings</Badge>}
      />

      <section aria-label="ETF portfolio summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border/80">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-medium text-muted-foreground">Recorded ETF holdings</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{holdings.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Based on saved portfolio positions</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-medium text-muted-foreground">Current value</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{marketValueCount > 0 ? formatIndianUnits(marketValue) : "—"}</p>
            <p className="mt-1 text-xs text-muted-foreground">{marketValueCount} of {holdings.length} holdings have a recorded current NAV</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-medium text-muted-foreground">Purchase value</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{purchaseValueCount > 0 ? formatIndianUnits(investedValue) : "—"}</p>
            <p className="mt-1 text-xs text-muted-foreground">{purchaseValueCount} of {holdings.length} holdings have a recorded purchase price</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-medium text-muted-foreground">Change on comparable holdings</p>
            <p className={cn("mt-2 text-2xl font-bold tracking-tight", comparableValue >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
              {returnPercent === null ? "—" : `${comparableValue >= 0 ? "+" : ""}${formatIndianUnits(comparableValue)}`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {returnPercent === null ? "Both current and purchase prices are required" : `${returnPercent >= 0 ? "+" : ""}${returnPercent.toFixed(2)}% across ${comparableHoldings.length} comparable holdings`}
            </p>
          </CardContent>
        </Card>
      </section>

      {holdings.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border bg-card">
          <CardContent className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <Layers className="mb-3 h-9 w-9 text-muted-foreground/60" />
            <h2 className="font-semibold text-foreground">No ETF holdings recorded</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              ETF positions will appear here when they are available in your portfolio data. No sample holdings or market prices are shown.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Holdings detail</h2>
              <p className="text-sm text-muted-foreground">Search positions and review recorded quantities and prices.</p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or symbol" className="h-10 rounded-xl pl-9" aria-label="Search ETF holdings" />
            </div>
          </div>

          {filteredHoldings.length === 0 ? (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="flex min-h-40 flex-col items-center justify-center text-center">
                <AlertCircle className="mb-2 h-7 w-7 text-muted-foreground/60" />
                <p className="font-medium">No holdings match “{search}”</p>
                <Button variant="link" onClick={() => setSearch("")}>Clear search</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {filteredHoldings.map((holding) => (
                  <button
                    key={holding.key}
                    type="button"
                    aria-pressed={selectedHolding?.key === holding.key}
                    onClick={() => setSelectedHoldingKey(holding.key)}
                    className={cn(
                      "shrink-0 rounded-xl border px-3 py-2 text-left transition-colors",
                      selectedHolding?.key === holding.key
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="block text-sm font-semibold">{holding.name}</span>
                    {holding.symbol && <span className="block text-xs opacity-75">{holding.symbol}</span>}
                  </button>
                ))}
              </div>

              {selectedHolding && (
                <Card className="rounded-2xl border-border/80">
                  <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 p-4 sm:p-5">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{selectedHolding.name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedHolding.symbol || "ETF"} · {selectedHolding.quantity.toLocaleString("en-IN")} units
                      </p>
                    </div>
                    {selectedGain !== null && (
                      <Badge variant={selectedGain >= 0 ? "secondary" : "destructive"} className="shrink-0">
                        {selectedGain >= 0 ? <TrendingUp className="mr-1 h-3.5 w-3.5" /> : <TrendingDown className="mr-1 h-3.5 w-3.5" />}
                        {selectedGain >= 0 ? "+" : ""}{formatIndianUnits(selectedGain)}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
                    <div><p className="text-xs text-muted-foreground">Current NAV</p><p className="mt-1 font-semibold">{selectedHolding.currentNav === null ? "Not recorded" : formatIndianUnits(selectedHolding.currentNav)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Purchase price</p><p className="mt-1 font-semibold">{selectedHolding.purchaseNav === null ? "Not recorded" : formatIndianUnits(selectedHolding.purchaseNav)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Current value</p><p className="mt-1 font-semibold">{selectedValue === null ? "Not available" : formatIndianUnits(selectedValue)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Purchase value</p><p className="mt-1 font-semibold">{selectedCost === null ? "Not available" : formatIndianUnits(selectedCost)}</p></div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(StockReports);
