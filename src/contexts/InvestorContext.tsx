import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { parseExcelFile, TransactionData } from "@/utils/parseTransactions";
import transactionsPath from "@/data/combined_transactions_1.xlsx";
import { useAuth } from "@/contexts/AuthContext";

interface InvestorContextType {
  selectedInvestor: string;
  setSelectedInvestor: (investor: string) => void;
  investors: string[];
  transactions: TransactionData[];
  filteredTransactions: TransactionData[];
  isNewUser: boolean;
}

const InvestorContext = createContext<InvestorContextType | undefined>(undefined);

export const InvestorProvider = ({ children }: { children: ReactNode }) => {
  const [selectedInvestor, setSelectedInvestor] = useState<string>("all");
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [investors, setInvestors] = useState<string[]>([]);
  const { isSuperAdmin, user } = useAuth();

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

  // Check if user is new (non-SuperAdmin users are considered "new" for PnL purposes)
  const isNewUser = !isSuperAdmin && !!user;

  // Filter transactions by investor - memoized for performance
  // SuperAdmin sees all investors; regular users see all transactions
  // but PnL is zeroed in usePortfolioData via the isNewUser flag.
  const filteredTransactions = useMemo(() => {
    if (selectedInvestor === "all") return transactions;
    return transactions.filter((t) => t.investorName === selectedInvestor);
  }, [selectedInvestor, transactions]);


  const contextValue = useMemo(() => ({
    selectedInvestor,
    setSelectedInvestor,
    investors,
    transactions,
    filteredTransactions,
    isNewUser,
  }), [selectedInvestor, investors, transactions, filteredTransactions, isNewUser]);

  return (
    <InvestorContext.Provider value={contextValue}>
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
