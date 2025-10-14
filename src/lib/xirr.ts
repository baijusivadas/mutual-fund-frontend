// XIRR (Extended Internal Rate of Return) calculation
export interface Transaction {
  date: Date;
  amount: number;
}

export function calculateXIRR(transactions: Transaction[], guess = 0.1): number | null {
  if (transactions.length < 2) return null;

  const sortedTransactions = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstDate = sortedTransactions[0].date;
  
  // Newton-Raphson method to find XIRR
  let rate = guess;
  const maxIterations = 100;
  const tolerance = 0.0000001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (const transaction of sortedTransactions) {
      const years = (transaction.date.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      const factor = Math.pow(1 + rate, years);
      
      npv += transaction.amount / factor;
      dnpv -= transaction.amount * years / Math.pow(1 + rate, years + 1);
    }

    const newRate = rate - npv / dnpv;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100; // Return as percentage
    }
    
    rate = newRate;
  }

  return null; // Failed to converge
}
