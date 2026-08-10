import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { parseExcelFile, TransactionData } from "@/utils/parseTransactions";
import transactionsPath from "@/data/combined_transactions_1.xlsx";
import { useAuth } from "@/contexts/AuthContext";
import { useUserInvestments } from "@/hooks/useUserInvestments";

interface InvestorContextType {
  selectedInvestor: string;
  setSelectedInvestor: (investor: string) => void;
  investors: string[];
  transactions: TransactionData[];
  filteredTransactions: TransactionData[];
  isNewUser: boolean;
}

const InvestorContext = createContext<InvestorContextType | undefined>(undefined);

const mapDbTransaction = (dbTx: any, isSell: boolean): TransactionData => {
  return {
    transactionType: dbTx.transaction_type || (isSell ? "Redemption" : "Purchase"),
    investorName: dbTx.investor_name || "",
    investmentDate: dbTx.date || "",
    schemeName: dbTx.scheme || "",
    units: Math.abs(Number(dbTx.units) || 0),
    nav: Number(dbTx.nav) || 0,
    value: Math.abs(Number(dbTx.amount) || 0),
    folioNumber: dbTx.folio || "",
    isSell: isSell,
  };
};

export const InvestorProvider = ({ children }: { children: ReactNode }) => {
  const [selectedInvestor, setSelectedInvestor] = useState<string>("all");
  const [excelTransactions, setExcelTransactions] = useState<TransactionData[]>([]);
  const { isSuperAdmin, user } = useAuth();
  
  // Fetch real-time database transactions mapped to the user
  const { purchases = [], redemptions = [], mappedInvestorNames = [], isLoading: isLoadingDb } = useUserInvestments();

  // Load the Excel fallback ONLY when:
  //   1. The DB query has finished (isLoadingDb === false)
  //   2. AND there are no DB transactions to show
  // This avoids fetching a large .xlsx file on every session when real data exists.
  useEffect(() => {
    if (isLoadingDb) return; // Wait for DB query to settle
    if (purchases.length > 0 || redemptions.length > 0) return; // DB has data — skip fallback

    const loadExcelTransactions = async () => {
      try {
        const allTransactions = await parseExcelFile(transactionsPath);
        setExcelTransactions(allTransactions);
      } catch (err) {
        console.error("Failed to load fallback transactions:", err);
      }
    };

    loadExcelTransactions();
  }, [isLoadingDb, purchases.length, redemptions.length]);

  // Compute unified transactions list
  const transactions = useMemo(() => {
    if (purchases.length > 0 || redemptions.length > 0) {
      const mappedPurchases = purchases.map((p) => mapDbTransaction(p, false));
      const mappedRedemptions = redemptions.map((r) => mapDbTransaction(r, true));
      return [...mappedPurchases, ...mappedRedemptions];
    }
    return excelTransactions;
  }, [purchases, redemptions, excelTransactions]);

  // Compute unique investor list dynamically from active transactions
  const investors = useMemo(() => {
    const uniqueInvestors = Array.from(
      new Set(transactions.map((t) => t.investorName?.trim()).filter(Boolean))
    );
    return uniqueInvestors.sort();
  }, [transactions]);

  // Check if user is a new/unmapped user (regular users with no investments mapped are considered "new" for fallback)
  const isNewUser = !isSuperAdmin && !!user && mappedInvestorNames.length === 0;

  // Filter transactions by investor - memoized for performance
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
