import { DataManager } from "@/components/shared/DataManager";
import { Banknote } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/DashboardLayout";

const defaultFormData = {
    liability_name: "",
    liability_type: "personal",
    principal_amount: "",
    outstanding_amount: "",
    interest_rate: "",
    monthly_payment: "",
    start_date: "",
    end_date: "",
    lender: "",
    status: "active",
    description: ""
};

const liabilityTypes = [
    { label: "Home Loan", value: "home" },
    { label: "Car Loan", value: "car" },
    { label: "Personal Loan", value: "personal" },
    { label: "Credit Card", value: "credit_card" },
    { label: "Education Loan", value: "education" },
    { label: "Other", value: "other" },
];

const statusFilters = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Paid Off", value: "paid" },
    { label: "Defaulted", value: "defaulted" }
];

const columns = [
    { key: "liability_name", label: "Liability Name", sortable: true, className: "font-medium" },
    {
        key: "liability_type", label: "Type", sortable: true, render: (item: any) =>
            liabilityTypes.find(t => t.value === item.liability_type)?.label || item.liability_type
    },
    { key: "outstanding_amount", label: "Outstanding", sortable: true, render: (item: any) => `₹${parseFloat(item.outstanding_amount).toLocaleString('en-IN')}` },
    { key: "interest_rate", label: "Interest", sortable: true, render: (item: any) => `${item.interest_rate}%` },
    { key: "monthly_payment", label: "EMI", sortable: true, render: (item: any) => `₹${parseFloat(item.monthly_payment).toLocaleString('en-IN')}` },
    { key: "lender", label: "Lender", sortable: true },
];

export default function Liabilities() {
    const renderForm = (formData: any, setFormData: any) => (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Liability Name *</Label>
                    <Input
                        value={formData.liability_name}
                        onChange={e => setFormData({ ...formData, liability_name: e.target.value })}
                        placeholder="e.g. HDFC Home Loan"
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Type *</Label>
                    <Select value={formData.liability_type} onValueChange={v => setFormData({ ...formData, liability_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {liabilityTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Principal Amount (₹) *</Label>
                    <Input type="number" value={formData.principal_amount} onChange={e => setFormData({ ...formData, principal_amount: e.target.value })} />
                </div>
                <div className="grid gap-2">
                    <Label>Outstanding Amount (₹) *</Label>
                    <Input type="number" value={formData.outstanding_amount} onChange={e => setFormData({ ...formData, outstanding_amount: e.target.value })} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Interest Rate (%) *</Label>
                    <Input type="number" step="0.1" value={formData.interest_rate} onChange={e => setFormData({ ...formData, interest_rate: e.target.value })} />
                </div>
                <div className="grid gap-2">
                    <Label>Monthly EMI (₹)</Label>
                    <Input type="number" value={formData.monthly_payment} onChange={e => setFormData({ ...formData, monthly_payment: e.target.value })} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
                <div className="grid gap-2">
                    <Label>End Date</Label>
                    <Input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Lender Bank/Institution</Label>
                    <Input value={formData.lender} onChange={e => setFormData({ ...formData, lender: e.target.value })} />
                </div>
                <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {statusFilters.filter(f => f.value !== 'all').map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
        </>
    );

    return (
        <DashboardLayout>
            <DataManager
                entity="liabilities"
                title="Liabilities & Loans"
                description="Track and manage all your liabilities including home loans, car loans, and credit cards."
                icon={<Banknote className="h-8 w-8 text-destructive" />}
                columns={columns}
                searchKeys={["liability_name", "lender"] as any}
                emptyMessage="No liabilities found."
                defaultFormData={defaultFormData}
                renderForm={renderForm}
                statusKey="status"
                statusFilters={statusFilters}
            />
        </DashboardLayout>
    );
}
