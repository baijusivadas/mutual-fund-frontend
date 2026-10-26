import { User, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvestor } from "@/contexts/InvestorContext";

export const InvestorSelector = () => {
  const { investors, selectedInvestor, setSelectedInvestor } = useInvestor();

  return (
    <div className="flex items-center">
      <Select value={selectedInvestor} onValueChange={setSelectedInvestor}>
        <SelectTrigger className="h-9 w-[200px] sm:w-[220px] rounded-xl bg-muted/50 border-border/50 text-xs font-semibold hover:bg-muted transition-colors gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <SelectValue placeholder="All Investors" />
        </SelectTrigger>
        <SelectContent className="glass-card rounded-2xl shadow-xl">
          <SelectItem value="all" className="text-xs font-semibold rounded-lg">
            All Investors (Consolidated)
          </SelectItem>
          {investors.map((investor) => (
            <SelectItem key={investor} value={investor} className="text-xs rounded-lg">
              {investor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
