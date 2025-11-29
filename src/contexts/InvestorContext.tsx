import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { parseExcelFile, TransactionData } from "@/utils/parseTransactions";
import transactionsPath from "@/data/combined_transactions_1.xlsx";

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
      const allTransactions = await parseExcelFile(transactionsPath);
      setTransactions(allTransactions);

      // Get unique investors (remove duplicates and filter out empty names)
      const uniqueInvestors = Array.from(
        new Set(allTransactions.map((t) => t.investorName?.trim()).filter(Boolean))
      );
      setInvestors(uniqueInvestors.sort());
    };

    loadTransactions();
  }, []);

  // Filter transactions by investor - memoized for performance
  const filteredTransactions = useMemo(() => 
    selectedInvestor === "all" 
      ? transactions 
      : transactions.filter((t) => t.investorName === selectedInvestor),
    [selectedInvestor, transactions]
  );

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