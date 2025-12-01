// Stock price chart data
export const stockPriceData = {
  reliance: [
    { date: "01 Oct", price: 2420 },
    { date: "02 Oct", price: 2435 },
    { date: "03 Oct", price: 2428 },
    { date: "04 Oct", price: 2445 },
    { date: "05 Oct", price: 2440 },
    { date: "06 Oct", price: 2455 },
    { date: "07 Oct", price: 2450 },
  ],
  hdfc: [
    { date: "01 Oct", price: 1665 },
    { date: "02 Oct", price: 1670 },
    { date: "03 Oct", price: 1668 },
    { date: "04 Oct", price: 1675 },
    { date: "05 Oct", price: 1678 },
    { date: "06 Oct", price: 1682 },
    { date: "07 Oct", price: 1680 },
  ],
  infosys: [
    { date: "01 Oct", price: 1505 },
    { date: "02 Oct", price: 1512 },
    { date: "03 Oct", price: 1508 },
    { date: "04 Oct", price: 1518 },
    { date: "05 Oct", price: 1515 },
    { date: "06 Oct", price: 1522 },
    { date: "07 Oct", price: 1520 },
  ],
};

// Stock details for reports
export const stockDetails = [
  {
    name: "Reliance Industries",
    symbol: "RELIANCE",
    sector: "Energy",
    holdings: 250,
    avgPrice: 2350,
    currentPrice: 2450,
    dayChange: "+0.82%",
    weekHigh: 2465,
    weekLow: 2410,
    dataKey: "reliance",
  },
  {
    name: "HDFC Bank",
    symbol: "HDFCBANK",
    sector: "Banking",
    holdings: 180,
    avgPrice: 1620,
    currentPrice: 1680,
    dayChange: "+1.20%",
    weekHigh: 1690,
    weekLow: 1655,
    dataKey: "hdfc",
  },
  {
    name: "Infosys",
    symbol: "INFY",
    sector: "IT",
    holdings: 150,
    avgPrice: 1480,
    currentPrice: 1520,
    dayChange: "-0.26%",
    weekHigh: 1535,
    weekLow: 1502,
    dataKey: "infosys",
  },
];

export type StockDetail = typeof stockDetails[number];
export type StockPriceDataKey = keyof typeof stockPriceData;
