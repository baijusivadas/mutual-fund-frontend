import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { TransactionData } from "@/utils/parseTransactions";
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

const defaultInvestorContext: InvestorContextType = {
  selectedInvestor: "all",
  setSelectedInvestor: () => {},
  investors: [],
  transactions: [],
  filteredTransactions: [],
  isNewUser: false,
};

const InvestorContext = createContext<InvestorContextType>(defaultInvestorContext);

interface DbTransaction {
  transaction_type?: string | null;
  investor_name?: string | null;
  date?: string | null;
  scheme?: string | null;
  units?: number | string | null;
  nav?: number | string | null;
  amount?: number | string | null;
  folio?: string | null;
}

const mapDbTransaction = (dbTx: DbTransaction, isSell: boolean): TransactionData => {
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
  const { isSuperAdmin, user } = useAuth();

  // Fetch real-time database transactions mapped to the user
  const { purchases = [], redemptions = [], mappedInvestorNames = [] } = useUserInvestments();

  // Transaction data must come from the authenticated API, never a public bundled workbook.
  const transactions = useMemo(() => {
    const mappedPurchases = purchases.map((p) => mapDbTransaction(p, false));
    const mappedRedemptions = redemptions.map((r) => mapDbTransaction(r, true));
    return [...mappedPurchases, ...mappedRedemptions];
  }, [purchases, redemptions]);

  // Compute unique investor list dynamically from active transactions
  const investors = useMemo(() => {
    const uniqueInvestors = Array.from(
      new Set(transactions.map((t) => t.investorName?.trim()).filter(Boolean))
    );
    return uniqueInvestors.sort();
  }, [transactions]);

  // Regular users without mapped investments should see an empty portfolio, not shared sample data.
  const isNewUser = !isSuperAdmin && !!user && mappedInvestorNames.length === 0;

  // Filter transactions by investor - memoized for performance
  const filteredTransactions = useMemo(() => {
    if (selectedInvestor === "all") return transactions;
    return transactions.filter((t) => t.investorName === selectedInvestor);
  }, [selectedInvestor, transactions]);

  const contextValue = useMemo(
    () => ({
      selectedInvestor,
      setSelectedInvestor,
      investors,
      transactions,
      filteredTransactions,
      isNewUser,
    }),
    [selectedInvestor, investors, transactions, filteredTransactions, isNewUser]
  );

  return <InvestorContext.Provider value={contextValue}>{children}</InvestorContext.Provider>;
};

export const useInvestor = () => {
  const context = useContext(InvestorContext);
  return context || defaultInvestorContext;
};
