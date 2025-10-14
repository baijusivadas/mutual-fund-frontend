import * as XLSX from 'xlsx';

export interface TransactionData {
  transactionType: string;
  investorName: string;
  investmentDate: string;
  schemeName: string;
  units: number;
  nav: number;
  value: number;
  folioNumber: string;
}

export async function parseExcelFile(filePath: string): Promise<TransactionData[]> {
  try {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    const transactions: TransactionData[] = [];
    
    // Skip header row
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      if (!row || row.length < 8 || !row[0]) {
        continue;
      }
      
      transactions.push({
        transactionType: String(row[0] || '').trim(),
        investorName: String(row[1] || '').trim(),
        investmentDate: String(row[2] || '').trim(),
        schemeName: String(row[3] || '').trim(),
        units: parseFloat(String(row[4] || '0')) || 0,
        nav: parseFloat(String(row[5] || '0')) || 0,
        value: parseFloat(String(row[6] || '0')) || 0,
        folioNumber: String(row[7] || '').trim(),
      });
    }
    
    return transactions;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return [];
  }
}
