import { User } from "lucide-react";
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
    <div className="flex items-center gap-3">
      <User className="h-5 w-5 text-muted-foreground" />
      <Select value={selectedInvestor} onValueChange={setSelectedInvestor}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select investor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Investors</SelectItem>
          {investors.map((investor) => (
            <SelectItem key={investor} value={investor}>
              {investor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
