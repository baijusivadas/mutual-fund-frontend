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
  isSell: boolean; // true for sell transactions (negative units/values)
}

export async function parseExcelFile(filePath: string): Promise<TransactionData[]> {
  try {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Try all sheets to find transaction data
    const transactions: TransactionData[] = [];
    
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // Find the header row by looking for "TransactionType" or similar
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(50, jsonData.length); i++) {
        const row = jsonData[i];
        if (row && row.length > 0) {
          const firstCell = String(row[0] || '').toLowerCase();
          // Check if this looks like a header row
          if (firstCell.includes('transaction') || firstCell.includes('investorname') || 
              (row.length >= 7 && String(row[1] || '').toLowerCase().includes('investor'))) {
            headerRowIndex = i;
            break;
          }
        }
      }
      
      // If no header found, skip this sheet
      if (headerRowIndex === -1) continue;
      
      // Parse data rows after header
      for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Skip empty rows or rows with insufficient data
        if (!row || row.length < 7 || !row[0] || !row[1]) {
          continue;
        }
        
        // Skip rows that look like they're part of summary tables
        const firstCell = String(row[0] || '').toLowerCase();
        if (firstCell.includes('sum of') || firstCell.includes('total') || 
            firstCell.includes('grand total') || firstCell === '') {
          continue;
        }
        
        try {
          const transactionType = String(row[0] || '').trim().toLowerCase();
          const units = parseFloat(String(row[4] || '0'));
          const nav = parseFloat(String(row[5] || '0'));
          const value = parseFloat(String(row[6] || '0'));
          
          // Skip invalid numeric data
          if (isNaN(units) || isNaN(nav) || isNaN(value)) {
            continue;
          }
          
          // Determine if this is a sell transaction based on:
          // 1. TransactionType containing "redemption" or "switchout"
          // 2. Negative values in units or value columns
          const isSell = 
            transactionType.includes('redemption') || 
            transactionType.includes('switchout') ||
            units < 0 || 
            value < 0;
          
          transactions.push({
            transactionType: String(row[0] || '').trim(),
            investorName: String(row[1] || '').trim(),
            investmentDate: String(row[2] || '').trim(),
            schemeName: String(row[3] || '').trim(),
            units: Math.abs(units), // Store absolute value
            nav: nav,
            value: Math.abs(value), // Store absolute value
            folioNumber: String(row[7] || '').trim(),
            isSell: isSell, // Flag to differentiate purchase/sell
          });
        } catch (err) {
          // Skip rows that can't be parsed
          console.warn('Skipping row due to parse error:', err);
          continue;
        }
      }
    }
    
    console.log(`Successfully parsed ${transactions.length} transactions`);
    return transactions;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return [];
  }
}
