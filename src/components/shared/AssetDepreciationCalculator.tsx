import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AssetDepreciationCalculator() {
    const [purchasePrice, setPurchasePrice] = useState("");
    const [years, setYears] = useState("3");
    const [rate, setRate] = useState("15");
    const [currentValue, setCurrentValue] = useState<number | null>(null);

    const calculate = () => {
        const price = parseFloat(purchasePrice);
        const y = parseInt(years);
        const r = parseFloat(rate) / 100;

        if (isNaN(price) || isNaN(y) || isNaN(r)) return;

        // Declining balance method: V = P * (1 - r)^y
        const val = price * Math.pow((1 - r), y);
        setCurrentValue(Math.max(0, val));
    };

    return (
        <Card className="mb-6 bg-gradient-to-r from-muted/50 to-muted border-muted">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Asset Depreciation Estimator
                </CardTitle>
                <CardDescription>Estimate the current value of vehicles or electronics</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="grid gap-2 flex-1">
                        <Label>Original Price (₹)</Label>
                        <Input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="e.g. 1500000" />
                    </div>
                    <div className="grid gap-2 flex-1">
                        <Label>Age (Years)</Label>
                        <Input type="number" value={years} onChange={e => setYears(e.target.value)} />
                    </div>
                    <div className="grid gap-2 flex-1">
                        <Label>Category (Est. Rate)</Label>
                        <Select value={rate} onValueChange={setRate}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15">Cars (15%/yr)</SelectItem>
                                <SelectItem value="10">2-Wheelers (10%/yr)</SelectItem>
                                <SelectItem value="40">Computers/IT (40%/yr)</SelectItem>
                                <SelectItem value="20">Furniture (20%/yr)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={calculate} className="w-full md:w-auto mt-4 md:mt-0">Estimate</Button>
                </div>

                {currentValue !== null && (
                    <div className="mt-6 p-4 rounded-lg bg-background border flex justify-between items-center">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingDown className="h-5 w-5" />
                            <span>Estimated Current Value:</span>
                        </div>
                        <span className="text-2xl font-bold">₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
