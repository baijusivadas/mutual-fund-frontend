import { useState, useMemo, useCallback, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterApi } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Building, TrendingUp, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";

interface FundHouse {
  id: string;
  name: string;
  MutualFunds?: { id: string }[];
}

interface MutualFund {
  id: string;
  name: string;
  isin: string;
  scheme_type: string;
  FundHouse?: { name: string };
}

const SEARCH_KEYS: (keyof MutualFund)[] = ["name", "isin"];

const MasterData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("mf");

  // --- Queries ---
  const { data: fundHouses } = useQuery<FundHouse[]>({
    queryKey: ["fundHouses"],
    queryFn: () => masterApi.getFundHouses().then((res) => res.data),
  });

  const { data: schemes } = useQuery<MutualFund[]>({
    queryKey: ["schemes"],
    queryFn: () => masterApi.getMutualFunds().then((res) => res.data),
  });

  const { data: stocks } = useQuery({
    queryKey: ["stocks"],
    queryFn: () => masterApi.getStocks().then((res) => res.data),
  });

  // --- Mutations ---
  const createFundHouseMutation = useMutation({
    mutationFn: (data: Record<string, FormDataEntryValue>) => masterApi.createFundHouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fundHouses"] });
      toast({ title: "Success", description: "Fund House added" });
    },
  });

  const createSchemeMutation = useMutation({
    mutationFn: (data: Record<string, FormDataEntryValue>) => masterApi.createMutualFund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      toast({ title: "Success", description: "Scheme added" });
    },
  });

  const handleFundHouseSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      createFundHouseMutation.mutate(Object.fromEntries(formData));
    },
    [createFundHouseMutation]
  );

  const handleSchemeSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      createSchemeMutation.mutate(Object.fromEntries(formData));
    },
    [createSchemeMutation]
  );

  const schemeColumns: ColumnConfig<MutualFund>[] = useMemo(
    () => [
      { key: "name", label: "Scheme Name", sortable: true, className: "font-semibold text-foreground" },
      {
        key: "FundHouse",
        label: "AMC",
        sortable: true,
        render: (item) => <span className="text-xs font-medium text-muted-foreground">{item.FundHouse?.name}</span>,
      },
      {
        key: "isin",
        label: "ISIN",
        sortable: true,
        className: "text-xs font-mono font-bold",
        render: (item) => <span className="bg-muted/60 px-2 py-0.5 rounded-md">{item.isin || "N/A"}</span>,
      },
      { key: "scheme_type", label: "Type", sortable: true, className: "text-xs capitalize font-medium" },
    ],
    []
  );

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Master Data Management"
        description="Global financial asset registry, AMC fund houses, and security ISIN classifications"
      />
      <div className="space-y-6">
        <Tabs defaultValue="mf" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full sm:max-w-xs grid-cols-2 bg-muted/60 p-1 rounded-xl border border-border/50">
            <TabsTrigger value="mf" className="rounded-lg text-xs font-bold">Mutual Funds</TabsTrigger>
            <TabsTrigger value="stocks" className="rounded-lg text-xs font-bold">Stocks</TabsTrigger>
          </TabsList>

          <TabsContent value="mf" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
                  <div>
                    <CardTitle className="text-base font-bold">Fund Houses</CardTitle>
                    <CardDescription className="text-xs">AMCs & Asset Managers</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="outline" className="rounded-full h-8 w-8">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Fund House</DialogTitle>
                      </DialogHeader>
                      <form className="space-y-4 pt-4" onSubmit={handleFundHouseSubmit}>
                        <Input
                          name="name"
                          placeholder="AMC Name (e.g. HDFC Mutual Fund)"
                          required
                        />
                        <Input name="website" placeholder="Website (optional)" />
                        <Button type="submit" className="w-full font-bold">
                          Add AMC
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {fundHouses?.map((fh) => (
                      <div
                        key={fh.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/70 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate">{fh.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {fh.MutualFunds?.length || 0} schemes registered
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
                  <div>
                    <CardTitle className="text-base font-bold">Schemes</CardTitle>
                    <CardDescription className="text-xs">Mutual Fund Scheme Master Directory</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="font-bold">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Scheme
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add Mutual Fund Scheme</DialogTitle>
                      </DialogHeader>
                      <form className="space-y-4 pt-4" onSubmit={handleSchemeSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">
                              AMC *
                            </label>
                            <select
                              name="fund_house_id"
                              className="w-full p-2.5 border border-border rounded-xl text-xs bg-background"
                              required
                            >
                              <option value="">Select AMC</option>
                              {fundHouses?.map((fh) => (
                                <option key={fh.id} value={fh.id}>
                                  {fh.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">
                              Scheme Name *
                            </label>
                            <Input name="name" placeholder="Full Scheme Name" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input name="isin" placeholder="ISIN (e.g. INF179K01924)" />
                          <Input name="amfi_code" placeholder="AMFI Code" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input name="scheme_type" placeholder="Type (e.g. Equity)" />
                          <Input name="category" placeholder="Category (e.g. Mid Cap)" />
                        </div>
                        <Button type="submit" className="w-full font-bold">
                          Add Scheme
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <CommonTable<MutualFund>
                    data={schemes || []}
                    columns={schemeColumns}
                    isLoading={!schemes}
                    searchPlaceholder="Search schemes by name or ISIN..."
                    searchKeys={SEARCH_KEYS}
                    emptyMessage="No schemes found"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stocks" className="space-y-6 mt-4">
            <Card className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-sm">
              <CardHeader className="pt-5 px-6 pb-2">
                <CardTitle className="text-base font-bold">Stocks Repository</CardTitle>
                <CardDescription className="text-xs">Equity and Index Security Master</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-16 border-2 border-dashed rounded-2xl border-border/50">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground font-medium">
                      Stock master directory is syncing with exchange feeds.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default memo(MasterData);
