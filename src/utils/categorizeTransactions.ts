import { TransactionData } from "./parseTransactions";

export interface UserSummary {
  investorName: string;
  totalInvestment: number;
  totalRedemption: number;
  netInvestment: number;
  transactionCount: number;
  schemesInvested: number;
}

export interface PurchaseTransaction extends TransactionData {
  category: 'purchase' | 'systematic';
}

export interface RedeemTransaction extends TransactionData {
  category: 'redeem' | 'switchout';
}

export interface MutualFundSummary {
  schemeName: string;
  totalInvestors: number;
  totalUnits: number;
  totalInvestment: number;
  totalRedemption: number;
  netInvestment: number;
  latestNav: number;
}

export function categorizeUsers(transactions: TransactionData[]): UserSummary[] {
  const userMap = new Map<string, UserSummary>();

  transactions.forEach((t) => {
    const userName = t.investorName?.trim();
    if (!userName) return;

    const existing = userMap.get(userName);
    const isRedeem = t.transactionType.toLowerCase().includes('redeem') || 
                     t.transactionType.toLowerCase().includes('switchout') ||
                     t.units < 0;
    
    const investment = isRedeem ? 0 : Math.abs(t.value);
    const redemption = isRedeem ? Math.abs(t.value) : 0;

    if (existing) {
      existing.totalInvestment += investment;
      existing.totalRedemption += redemption;
      existing.netInvestment = existing.totalInvestment - existing.totalRedemption;
      existing.transactionCount++;
    } else {
      userMap.set(userName, {
        investorName: userName,
        totalInvestment: investment,
        totalRedemption: redemption,
        netInvestment: investment - redemption,
        transactionCount: 1,
        schemesInvested: 0,
      });
    }
  });

  // Calculate unique schemes per user
  userMap.forEach((user) => {
    const userSchemes = new Set(
      transactions
        .filter((t) => t.investorName?.trim() === user.investorName)
        .map((t) => t.schemeName)
    );
    user.schemesInvested = userSchemes.size;
  });

  return Array.from(userMap.values()).sort((a, b) => 
    b.netInvestment - a.netInvestment
  );
}

export function categorizePurchases(transactions: TransactionData[]): PurchaseTransaction[] {
  return transactions
    .filter((t) => {
      const type = t.transactionType.toLowerCase();
      return (
        (type.includes('purchase') || type.includes('systematic')) &&
        !type.includes('redeem') &&
        !type.includes('switchout') &&
        t.units > 0
      );
    })
    .map((t) => ({
      ...t,
      category: (t.transactionType.toLowerCase().includes('systematic') 
        ? 'systematic' 
        : 'purchase') as 'purchase' | 'systematic',
    }))
    .sort((a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime());
}

export function categorizeRedemptions(transactions: TransactionData[]): RedeemTransaction[] {
  return transactions
    .filter((t) => {
      const type = t.transactionType.toLowerCase();
      return (
        type.includes('redeem') ||
        type.includes('switchout') ||
        t.units < 0
      );
    })
    .map((t) => ({
      ...t,
      category: (t.transactionType.toLowerCase().includes('switchout') 
        ? 'switchout' 
        : 'redeem') as 'redeem' | 'switchout',
    }))
    .sort((a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime());
}

export function categorizeMutualFunds(transactions: TransactionData[]): MutualFundSummary[] {
  const fundMap = new Map<string, MutualFundSummary>();

  transactions.forEach((t) => {
    const schemeName = t.schemeName?.trim();
    if (!schemeName) return;

    const existing = fundMap.get(schemeName);
    const isRedeem = t.transactionType.toLowerCase().includes('redeem') || 
                     t.transactionType.toLowerCase().includes('switchout') ||
                     t.units < 0;
    
    const investment = isRedeem ? 0 : Math.abs(t.value);
    const redemption = isRedeem ? Math.abs(t.value) : 0;
    const units = isRedeem ? -Math.abs(t.units) : Math.abs(t.units);

    if (existing) {
      existing.totalUnits += units;
      existing.totalInvestment += investment;
      existing.totalRedemption += redemption;
      existing.netInvestment = existing.totalInvestment - existing.totalRedemption;
      existing.latestNav = t.nav;
    } else {
      fundMap.set(schemeName, {
        schemeName,
        totalInvestors: 0,
        totalUnits: units,
        totalInvestment: investment,
        totalRedemption: redemption,
        netInvestment: investment - redemption,
        latestNav: t.nav,
      });
    }
  });

  // Calculate unique investors per fund
  fundMap.forEach((fund) => {
    const fundInvestors = new Set(
      transactions
        .filter((t) => t.schemeName?.trim() === fund.schemeName)
        .map((t) => t.investorName?.trim())
        .filter(Boolean)
    );
    fund.totalInvestors = fundInvestors.size;
  });

  return Array.from(fundMap.values()).sort((a, b) => 
    b.netInvestment - a.netInvestment
  );
}
