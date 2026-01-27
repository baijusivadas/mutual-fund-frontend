import * as XLSX from "xlsx";

export interface ParsedTransaction {
    transactionType: string;
    investorName: string;
    date: string;
    schemeName: string;
    units: number;
    nav: number;
    amount: number;
    folioNo: string;
}

export const parseExcel = async (file: File): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "array" });
                const transactions: ParsedTransaction[] = [];

                for (const sheetName of workbook.SheetNames) {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                    // Find header row
                    let headerRowIndex = -1;
                    for (let i = 0; i < Math.min(50, jsonData.length); i++) {
                        const row = jsonData[i];
                        if (row && row.length > 0) {
                            const firstCell = String(row[0] || "").toLowerCase();
                            if (
                                firstCell.includes("transaction") ||
                                firstCell.includes("investorname") ||
                                (row.length >= 7 && String(row[1] || "").toLowerCase().includes("investor"))
                            ) {
                                headerRowIndex = i;
                                break;
                            }
                        }
                    }

                    if (headerRowIndex === -1) continue;

                    // Parse data rows
                    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (!row || row.length < 7 || !row[0] || !row[1]) continue;

                        const firstCell = String(row[0] || "").toLowerCase();
                        if (
                            firstCell.includes("sum of") ||
                            firstCell.includes("total") ||
                            firstCell.includes("grand total") ||
                            firstCell === ""
                        ) {
                            continue;
                        }

                        try {
                            const units = parseFloat(String(row[4] || "0"));
                            const nav = parseFloat(String(row[5] || "0"));
                            const amount = parseFloat(String(row[6] || "0"));

                            if (isNaN(units) || isNaN(nav) || isNaN(amount)) continue;

                            transactions.push({
                                transactionType: String(row[0] || "").trim(),
                                investorName: String(row[1] || "").trim(),
                                date: String(row[2] || "").trim(),
                                schemeName: String(row[3] || "").trim(),
                                units: Math.abs(units),
                                nav,
                                amount: Math.abs(amount),
                                folioNo: String(row[7] || "").trim(),
                            });
                        } catch {
                            continue;
                        }
                    }
                }

                resolve(transactions);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};
