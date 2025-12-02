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
  // SuperAdmin can see all investors, regular users see all transactions but with zeroed PnL
  const filteredTransactions = useMemo(() => {
    const baseTransactions = selectedInvestor === "all" 
      ? transactions 
      : transactions.filter((t) => t.investorName === selectedInvestor);
    
    // For non-SuperAdmin users, return transactions with zeroed values for PnL calculation
    // They can still see the stock names and structure, but PnL will show as 0
    if (isNewUser) {
      return baseTransactions.map(t => ({
        ...t,
        // Keep original data structure but flag for PnL zeroing
        _isNewUserView: true,
      }));
    }
    
    return baseTransactions;
  }, [selectedInvestor, transactions, isNewUser]);

  return (
    <InvestorContext.Provider
      value={{
        selectedInvestor,
        setSelectedInvestor,
        investors,
        transactions,
        filteredTransactions,
        isNewUser,
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