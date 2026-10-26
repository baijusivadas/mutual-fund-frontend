export interface TransactionData {
  transactionType: string;
  investorName: string;
  investmentDate: string;
  schemeName: string;
  units: number;
  nav: number;
  value: number;
  folioNumber: string;
  isSell: boolean; // true for sell transactions (negative units/values)
}

export function isSellTransaction(
  transaction: Pick<TransactionData, "isSell" | "transactionType">
): boolean {
  return transaction.isSell || /redeem|switch[\s-]*out|sell/i.test(transaction.transactionType);
}
