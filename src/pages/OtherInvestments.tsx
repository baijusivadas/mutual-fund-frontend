import { DataManager } from "@/components/shared/DataManager";
import { Bitcoin, LandPlot, MonitorUp, PiggyBank } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OtherInvestments() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Other Investments</h2>
                    <p className="text-muted-foreground">Manage your Crypto, Bonds, SNPs/ETFs, and NPS.</p>
                </div>

                <Tabs defaultValue="crypto" className="w-full">
                    <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
                        <TabsTrigger value="bonds">Bonds</TabsTrigger>
                        <TabsTrigger value="etfs">ETFs</TabsTrigger>
                        <TabsTrigger value="nps">NPS</TabsTrigger>
                    </TabsList>

                    <TabsContent value="crypto" className="mt-6">
                        <CryptoManager />
                    </TabsContent>
                    <TabsContent value="bonds" className="mt-6">
                        <BondManager />
                    </TabsContent>
                    <TabsContent value="etfs" className="mt-6">
                        <EtfManager />
                    </TabsContent>
                    <TabsContent value="nps" className="mt-6">
                        <NpsManager />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

function CryptoManager() {
    const defaultForm = { item_name: "", symbol: "", quantity: "", average_price: "", purchase_date: "", description: "" };
    const columns = [
        { key: "item_name", label: "Name", sortable: true },
        { key: "symbol", label: "Symbol", sortable: true },
        { key: "quantity", label: "Quantity", sortable: true },
        { key: "average_price", label: "Avg Price", sortable: true, render: (i: any) => `₹${parseFloat(i.average_price).toLocaleString('en-IN')}` }
    ];

    return (
        <DataManager
            entity="crypto_investments"
            title="Cryptocurrency"
            description="Track Bitcoin, Ethereum, and other crypto assets."
            icon={<Bitcoin className="h-8 w-8 text-orange-500" />}
            columns={columns}
            searchKeys={["item_name", "symbol"] as any}
            emptyMessage="No crypto investments found."
            defaultFormData={defaultForm}
            renderForm={(formData, set) => (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Asset Name</Label><Input value={formData.item_name} onChange={e => set({ ...formData, item_name: e.target.value })} placeholder="Bitcoin" /></div>
                        <div className="grid gap-2"><Label>Symbol</Label><Input value={formData.symbol} onChange={e => set({ ...formData, symbol: e.target.value })} placeholder="BTC" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Quantity</Label><Input type="number" step="0.0001" value={formData.quantity} onChange={e => set({ ...formData, quantity: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Average Price (₹)</Label><Input type="number" step="0.01" value={formData.average_price} onChange={e => set({ ...formData, average_price: e.target.value })} /></div>
                    </div>
                    <div className="grid gap-2"><Label>Purchase Date</Label><Input type="date" value={formData.purchase_date} onChange={e => set({ ...formData, purchase_date: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={e => set({ ...formData, description: e.target.value })} /></div>
                </>
            )}
        />
    );
}

function BondManager() {
    const defaultForm = { bond_name: "", isin: "", face_value: "", quantity: "", coupon_rate: "", maturity_date: "", purchase_date: "" };
    const columns = [
        { key: "bond_name", label: "Bond Name", sortable: true },
        { key: "isin", label: "ISIN", sortable: true },
        { key: "coupon_rate", label: "Coupon Rate", sortable: true, render: (i: any) => `${i.coupon_rate}%` },
        { key: "maturity_date", label: "Maturity", sortable: true, render: (i: any) => new Date(i.maturity_date).toLocaleDateString() }
    ];

    return (
        <DataManager
            entity="bonds"
            title="Bonds"
            description="Track corporate and government bonds."
            icon={<LandPlot className="h-8 w-8 text-blue-500" />}
            columns={columns}
            searchKeys={["bond_name", "isin"] as any}
            emptyMessage="No bonds found."
            defaultFormData={defaultForm}
            renderForm={(formData, set) => (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Bond Name</Label><Input value={formData.bond_name} onChange={e => set({ ...formData, bond_name: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>ISIN</Label><Input value={formData.isin} onChange={e => set({ ...formData, isin: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2"><Label>Face Value (₹)</Label><Input type="number" value={formData.face_value} onChange={e => set({ ...formData, face_value: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Quantity</Label><Input type="number" value={formData.quantity} onChange={e => set({ ...formData, quantity: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Coupon Rate %</Label><Input type="number" step="0.1" value={formData.coupon_rate} onChange={e => set({ ...formData, coupon_rate: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Purchase Date</Label><Input type="date" value={formData.purchase_date} onChange={e => set({ ...formData, purchase_date: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Maturity Date</Label><Input type="date" value={formData.maturity_date} onChange={e => set({ ...formData, maturity_date: e.target.value })} /></div>
                    </div>
                </>
            )}
        />
    );
}

function EtfManager() {
    const defaultForm = { etf_name: "", symbol: "", quantity: "", purchase_price: "", purchase_date: "" };
    const columns = [
        { key: "etf_name", label: "ETF Name", sortable: true },
        { key: "symbol", label: "Symbol", sortable: true },
        { key: "quantity", label: "Quantity", sortable: true },
        { key: "purchase_price", label: "Purchase Price", sortable: true, render: (i: any) => `₹${parseFloat(i.purchase_price).toLocaleString('en-IN')}` }
    ];

    return (
        <DataManager
            entity="etfs"
            title="Exchange Traded Funds"
            description="Track your ETF portfolio."
            icon={<MonitorUp className="h-8 w-8 text-green-500" />}
            columns={columns}
            searchKeys={["etf_name", "symbol"] as any}
            emptyMessage="No ETFs found."
            defaultFormData={defaultForm}
            renderForm={(formData, set) => (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>ETF Name</Label><Input value={formData.etf_name} onChange={e => set({ ...formData, etf_name: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Symbol</Label><Input value={formData.symbol} onChange={e => set({ ...formData, symbol: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Quantity</Label><Input type="number" value={formData.quantity} onChange={e => set({ ...formData, quantity: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Price per Unit (₹)</Label><Input type="number" value={formData.purchase_price} onChange={e => set({ ...formData, purchase_price: e.target.value })} /></div>
                    </div>
                    <div className="grid gap-2"><Label>Purchase Date</Label><Input type="date" value={formData.purchase_date} onChange={e => set({ ...formData, purchase_date: e.target.value })} /></div>
                </>
            )}
        />
    );
}

function NpsManager() {
    const defaultForm = { pran: "", amount_invested: "", scheme_preference: "" };
    const columns = [
        { key: "pran", label: "PRAN Details", sortable: true },
        { key: "scheme_preference", label: "Scheme Preference", sortable: true },
        { key: "amount_invested", label: "Invested Amount", sortable: true, render: (i: any) => `₹${parseFloat(i.amount_invested).toLocaleString('en-IN')}` }
    ];

    return (
        <DataManager
            entity="nps_investments"
            title="National Pension System"
            description="Track your Tier I and Tier II NPS accounts."
            icon={<PiggyBank className="h-8 w-8 text-purple-500" />}
            columns={columns}
            searchKeys={["pran"] as any}
            emptyMessage="No NPS accounts found."
            defaultFormData={defaultForm}
            renderForm={(formData, set) => (
                <>
                    <div className="grid gap-2"><Label>Identifier (e.g. PRAN / Account)</Label><Input value={formData.pran} onChange={e => set({ ...formData, pran: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Total Invested (₹)</Label><Input type="number" value={formData.amount_invested} onChange={e => set({ ...formData, amount_invested: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Scheme Preference (e.g. Auto/Active C50 G50)</Label><Input value={formData.scheme_preference} onChange={e => set({ ...formData, scheme_preference: e.target.value })} /></div>
                </>
            )}
        />
    );
}
