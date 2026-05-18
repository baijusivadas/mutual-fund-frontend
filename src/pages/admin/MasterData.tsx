import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterApi } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Building, BookOpen, TrendingUp, Landmark, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonTable } from "@/components/shared/CommonTable";
import { CommonCard } from "@/components/shared/CommonCard";

const MasterData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("mf");

  // --- Queries ---
  const { data: fundHouses } = useQuery({
    queryKey: ["fundHouses"],
    queryFn: () => masterApi.getFundHouses().then(res => res.data),
  });

  const { data: schemes } = useQuery({
    queryKey: ["schemes"],
    queryFn: () => masterApi.getMutualFunds().then(res => res.data),
  });

  const { data: stocks } = useQuery({
    queryKey: ["stocks"],
    queryFn: () => masterApi.getStocks().then(res => res.data),
  });

  // --- Mutations ---
  const createFundHouseMutation = useMutation({
    mutationFn: (data: any) => masterApi.createFundHouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fundHouses"] });
      toast({ title: "Success", description: "Fund House added" });
    },
  });

  const createSchemeMutation = useMutation({
    mutationFn: (data: any) => masterApi.createMutualFund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      toast({ title: "Success", description: "Scheme added" });
    },
  });

  return (
    <DashboardLayout>
      <PageHeader 
        title="Master Data Management" 
        description="Admin tools for managing the global asset repository." 
      />
      <div className="space-y-6">

      <Tabs defaultValue="mf" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="mf" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Mutual Funds
          </TabsTrigger>
          <TabsTrigger value="stocks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Stocks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mf" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-primary/10 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Fund Houses</CardTitle>
                  <CardDescription>AMCs & Asset Managers</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="outline" className="rounded-full h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Fund House</DialogTitle></DialogHeader>
                    <form className="space-y-4 pt-4" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createFundHouseMutation.mutate(Object.fromEntries(formData));
                    }}>
                      <Input name="name" placeholder="AMC Name (e.g. HDFC Mutual Fund)" required />
                      <Input name="website" placeholder="Website" />
                      <Button type="submit" className="w-full">Add AMC</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fundHouses?.map((fh: any) => (
                    <div key={fh.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <Building className="h-5 w-5 text-primary/70" />
                      <div>
                        <p className="text-sm font-medium">{fh.name}</p>
                        <p className="text-xs text-muted-foreground">{fh.MutualFunds?.length || 0} schemes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-primary/10 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Schemes</CardTitle>
                  <CardDescription>Mutual Fund Scheme Repository</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Scheme
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Add Mutual Fund Scheme</DialogTitle></DialogHeader>
                    <form className="space-y-4 pt-4" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createSchemeMutation.mutate(Object.fromEntries(formData));
                    }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">AMC</label>
                          <select name="fund_house_id" className="w-full p-2 border rounded-md text-sm" required>
                            <option value="">Select AMC</option>
                            {fundHouses?.map((fh: any) => (
                              <option key={fh.id} value={fh.id}>{fh.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Scheme Name</label>
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
                      <Button type="submit" className="w-full">Add Scheme</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <CommonTable
                  data={schemes || []}
                  columns={[
                    { key: "name", label: "Scheme", sortable: true, className: "font-medium" },
                    { key: "FundHouse", label: "AMC", sortable: true, render: (item: any) => <span className="text-xs">{item.FundHouse?.name}</span> },
                    { key: "isin", label: "ISIN", sortable: true, className: "text-xs font-mono" },
                    { key: "scheme_type", label: "Type", sortable: true, className: "text-xs" }
                  ]}
                  isLoading={!schemes}
                  searchPlaceholder="Search schemes..."
                  searchKeys={["name", "isin"]}
                  emptyMessage="No schemes found"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stocks" className="space-y-6 mt-6">
          <Card className="border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle>Stocks Repository</CardTitle>
              <CardDescription>Equity and Index management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-20 border-2 border-dashed rounded-xl border-muted">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-medium">Stock management is currently in preview.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MasterData;
