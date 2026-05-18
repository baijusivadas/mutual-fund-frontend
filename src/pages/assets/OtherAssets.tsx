import { DataManager } from "@/components/shared/DataManager";
import { Landmark, PiggyBank, Briefcase } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssetDepreciationCalculator } from "@/components/shared/AssetDepreciationCalculator";
import { PageHeader } from "@/components/shared/PageHeader";

export default function OtherAssets() {
    return (
        <DashboardLayout>
            <PageHeader 
                title="Other Assets" 
                description="Manage your Bank Accounts, FDs, PPF, EPF, and Custom Assets." 
            />
            <div className="space-y-6">

                <Tabs defaultValue="bank" className="w-full">
                    <TabsList className="grid w-full md:w-auto grid-cols-3">
                        <TabsTrigger value="bank">Bank Accounts & FDs</TabsTrigger>
                        <TabsTrigger value="provident">Provident Funds</TabsTrigger>
                        <TabsTrigger value="custom">Custom Assets</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bank" className="mt-6">
                        <BankAccountManager />
                    </TabsContent>
                    <TabsContent value="provident" className="mt-6">
                        <ProvidentFundManager />
                    </TabsContent>
                    <TabsContent value="custom" className="mt-6">
                        <CustomAssetManager />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

function BankAccountManager() {
    const defaultForm = { bank_name: "", account_type: "savings", account_number: "", current_balance: "", interest_rate: "", maturity_date: "" };
    const columns = [
        { key: "bank_name", label: "Bank Name", sortable: true },
        { key: "account_type", label: "Type", sortable: true, render: (i: any) => i.account_type.toUpperCase() },
        { key: "current_balance", label: "Balance", sortable: true, render: (i: any) => `₹${parseFloat(i.current_balance).toLocaleString('en-IN')}` },
        { key: "interest_rate", label: "Interest Rate", sortable: true, render: (i: any) => i.interest_rate ? `${i.interest_rate}%` : '-' }
    ];

    return (
        <DataManager
            entity="bank_accounts"
            title="Bank Accounts"
            description="Track Savings, Current, FD, and RD accounts."
            icon={<Landmark className="h-8 w-8 text-blue-500" />}
            columns={columns}
            searchKeys={["bank_name", "account_number"] as any}
            emptyMessage="No bank accounts found."
            defaultFormData={defaultForm}
            hideHeader={true}
            renderForm={(formData, set) => (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Bank Name</Label><Input value={formData.bank_name} onChange={e => set({ ...formData, bank_name: e.target.value })} placeholder="HDFC Bank" /></div>
                        <div className="grid gap-2">
                            <Label>Account Type</Label>
                            <Select value={formData.account_type} onValueChange={v => set({ ...formData, account_type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="savings">Savings Account</SelectItem>
                                    <SelectItem value="current">Current Account</SelectItem>
                                    <SelectItem value="fd">Fixed Deposit (FD)</SelectItem>
                                    <SelectItem value="rd">Recurring Deposit (RD)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Account Number</Label><Input type="text" value={formData.account_number} onChange={e => set({ ...formData, account_number: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Current Balance (₹)</Label><Input type="number" step="0.01" value={formData.current_balance} onChange={e => set({ ...formData, current_balance: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Interest Rate % (Optional)</Label><Input type="number" step="0.1" value={formData.interest_rate} onChange={e => set({ ...formData, interest_rate: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Maturity Date (FD/RD)</Label><Input type="date" value={formData.maturity_date} onChange={e => set({ ...formData, maturity_date: e.target.value })} /></div>
                    </div>
                </>
            )}
        />
    );
}

function ProvidentFundManager() {
    const defaultForm = { fund_type: "EPF", current_value: "", monthly_contribution: "", interest_rate: "" };
    const columns = [
        { key: "fund_type", label: "Fund Type", sortable: true },
        { key: "current_value", label: "Current Value", sortable: true, render: (i: any) => `₹${parseFloat(i.current_value).toLocaleString('en-IN')}` },
        { key: "monthly_contribution", label: "Monthly Contribution", sortable: true, render: (i: any) => `₹${parseFloat(i.monthly_contribution).toLocaleString('en-IN')}` },
    ];

    return (
        <DataManager
            entity="provident_funds"
            title="Provident Funds"
            description="Track Employee (EPF) and Public Provident Funds (PPF)."
            icon={<PiggyBank className="h-8 w-8 text-green-500" />}
            columns={columns}
            searchKeys={["fund_type"] as any}
            emptyMessage="No provident funds found."
            defaultFormData={defaultForm}
            hideHeader={true}
            renderForm={(formData, set) => (
                <>
                    <div className="grid gap-2">
                        <Label>Fund Type</Label>
                        <Select value={formData.fund_type} onValueChange={v => set({ ...formData, fund_type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EPF">Employee Provident Fund (EPF)</SelectItem>
                                <SelectItem value="PPF">Public Provident Fund (PPF)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Current Accumulated Value (₹)</Label><Input type="number" value={formData.current_value} onChange={e => set({ ...formData, current_value: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Monthly Contribution (₹)</Label><Input type="number" value={formData.monthly_contribution} onChange={e => set({ ...formData, monthly_contribution: e.target.value })} /></div>
                    </div>
                    <div className="grid gap-2"><Label>Interest Rate %</Label><Input type="number" step="0.1" value={formData.interest_rate} onChange={e => set({ ...formData, interest_rate: e.target.value })} /></div>
                </>
            )}
        />
    );
}

function CustomAssetManager() {
    const defaultForm = { asset_name: "", asset_type: "vehicle", current_value: "", purchase_price: "", purchase_date: "", description: "" };
    const columns = [
        { key: "asset_name", label: "Asset Name", sortable: true },
        { key: "asset_type", label: "Type", sortable: true, render: (i: any) => i.asset_type.toUpperCase() },
        { key: "purchase_price", label: "Purchase", sortable: true, render: (i: any) => `₹${parseFloat(i.purchase_price).toLocaleString('en-IN')}` },
        { key: "current_value", label: "Current", sortable: true, render: (i: any) => `₹${parseFloat(i.current_value).toLocaleString('en-IN')}` },
        {
            key: "appreciation",
            label: "Gain / Loss",
            sortable: false,
            render: (i: any) => {
                const purchase = parseFloat(i.purchase_price) || 0;
                const current = parseFloat(i.current_value) || 0;
                const diff = current - purchase;
                const percent = purchase > 0 ? ((diff / purchase) * 100).toFixed(2) : 0;
                const isPositive = diff >= 0;
                return (
                    <span className={`font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        {isPositive ? '+' : ''}₹{Math.abs(diff).toLocaleString('en-IN')}
                        <span className="text-xs ml-1 opacity-80">({percent}%)</span>
                    </span>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <AssetDepreciationCalculator />
            <DataManager
                entity="custom_assets"
                title="Custom Assets"
                description="Track Vehicles, Art, Collectibles, and other assets."
                icon={<Briefcase className="h-8 w-8 text-yellow-500" />}
                columns={columns}
                searchKeys={["asset_name", "asset_type"] as any}
                emptyMessage="No custom assets found."
                defaultFormData={defaultForm}
                hideHeader={true}
                renderForm={(formData, set) => (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Asset Name</Label><Input value={formData.asset_name} onChange={e => set({ ...formData, asset_name: e.target.value })} /></div>
                            <div className="grid gap-2">
                                <Label>Asset Type</Label>
                                <Select value={formData.asset_type} onValueChange={v => set({ ...formData, asset_type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vehicle">Car / Bike / Vehicle</SelectItem>
                                        <SelectItem value="art">Art & Collectibles</SelectItem>
                                        <SelectItem value="jewelry">Jewelry (Non-Gold)</SelectItem>
                                        <SelectItem value="other">Other Asset</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Purchase Price (₹)</Label><Input type="number" value={formData.purchase_price} onChange={e => set({ ...formData, purchase_price: e.target.value })} /></div>
                            <div className="grid gap-2"><Label>Current Estimated Value (₹)</Label><Input type="number" value={formData.current_value} onChange={e => set({ ...formData, current_value: e.target.value })} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Purchase Date</Label><Input type="date" value={formData.purchase_date} onChange={e => set({ ...formData, purchase_date: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Description / Details</Label><Textarea value={formData.description} onChange={e => set({ ...formData, description: e.target.value })} /></div>
                    </>
                )}
            />
        </div>
    );
}
