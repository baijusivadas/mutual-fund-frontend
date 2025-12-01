// Capital gains trade data
export interface TradeRecord {
  stock: string;
  buyDate: string;
  sellDate: string;
  buyPrice: number;
  sellPrice: number;
  qty: number;
  gain: number;
}

export const shortTermGains: TradeRecord[] = [
  { stock: "HDFC Bank", buyDate: "2025-02-15", sellDate: "2025-06-20", buyPrice: 1620, sellPrice: 1680, qty: 30, gain: 1800 },
  { stock: "Wipro", buyDate: "2025-03-10", sellDate: "2025-08-05", buyPrice: 450, sellPrice: 485, qty: 60, gain: 2100 },
  { stock: "Asian Paints", buyDate: "2025-01-20", sellDate: "2025-05-15", buyPrice: 3050, sellPrice: 3150, qty: 25, gain: 2500 },
];

export const longTermGains: TradeRecord[] = [
  { stock: "Reliance Industries", buyDate: "2023-05-10", sellDate: "2025-07-15", buyPrice: 2100, sellPrice: 2450, qty: 50, gain: 17500 },
  { stock: "Infosys", buyDate: "2023-08-20", sellDate: "2025-06-10", buyPrice: 1350, sellPrice: 1520, qty: 75, gain: 12750 },
  { stock: "TCS", buyDate: "2023-03-15", sellDate: "2025-09-05", buyPrice: 3500, sellPrice: 3850, qty: 40, gain: 14000 },
];

// Tax rates
export const TAX_RATES = {
  shortTerm: 0.15, // 15% STCG tax
  longTerm: 0.10,  // 10% LTCG tax
};

// Calculate totals
export const calculateTotals = (gains: TradeRecord[]) => {
  return gains.reduce((sum, item) => sum + item.gain, 0);
};
