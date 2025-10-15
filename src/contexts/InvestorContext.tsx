import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { parseExcelFile, TransactionData } from "@/utils/parseTransactions";
import transaction2Path from "@/data/Transaction2.xlsx";
import transaction3Path from "@/data/Transaction3.xlsx";

interface InvestorContextType {
  selectedInvestor: string;
  setSelectedInvestor: (investor: string) => void;
  investors: string[];
  transactions: TransactionData[];
  filteredTransactions: TransactionData[];
}

const InvestorContext = createContext<InvestorContextType | undefined>(undefined);

export const InvestorProvider = ({ children }: { children: ReactNode }) => {
  const [selectedInvestor, setSelectedInvestor] = useState<string>("all");
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [investors, setInvestors] = useState<string[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      const [trans2, trans3] = await Promise.all([
        parseExcelFile(transaction2Path),
        parseExcelFile(transaction3Path),
      ]);
      
      const allTransactions = [...trans2, ...trans3];
      setTransactions(allTransactions);

      // Get unique investors (remove duplicates and filter out empty names)
      const uniqueInvestors = Array.from(
        new Set(allTransactions.map((t) => t.investorName?.trim()).filter(Boolean))
      );
      setInvestors(uniqueInvestors.sort());
    };

    loadTransactions();
  }, []);

  // Filter transactions by investor
  const filteredTransactions = selectedInvestor === "all" 
    ? transactions 
    : transactions.filter((t) => t.investorName === selectedInvestor);

  return (
    <InvestorContext.Provider
      value={{
        selectedInvestor,
        setSelectedInvestor,
        investors,
        transactions,
        filteredTransactions,
      }}
    >
      {children}
    </InvestorContext.Provider>
  );
};

export const useInvestor = () => {
  const context = useContext(InvestorContext);
  if (context === undefined) {
    throw new Error("useInvestor must be used within an InvestorProvider");
  }
  return context;
};
