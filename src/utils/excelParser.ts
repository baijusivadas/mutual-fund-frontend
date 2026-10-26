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
        let foundHeader = false;

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
            header: 1,
            defval: null,
            raw: true,
          });
          const normalizeHeader = (value: unknown) =>
            String(value ?? "")
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");
          const aliases: Record<string, string[]> = {
            transactionType: [
              "transactiontype",
              "tansactiontype",
              "transaction",
              "type",
              "txntype",
              "trantype",
              "nature",
              "trans",
              "trxtype",
            ],
            investorName: [
              "investorname",
              "investor",
              "unitholder",
              "unitholdername",
              "holdername",
              "clientname",
              "client",
              "name",
              "holder",
              "applicant",
            ],
            date: [
              "date",
              "transactiondate",
              "investmentdate",
              "trandate",
              "txndate",
              "trxndate",
              "invdate",
              "orderdate",
              "processdate",
            ],
            schemeName: [
              "schemename",
              "scheme",
              "fundname",
              "mutualfundname",
              "fund",
              "security",
              "scrip",
              "description",
              "plan",
            ],
            units: ["units", "unit", "quantity", "qty", "purchasesellunits", "shares", "balanceunits"],
            nav: ["nav", "priceperunit", "unitprice", "purchasesellnav", "rate", "price", "purchaseprice"],
            amount: [
              "amount",
              "transactionamount",
              "totalamount",
              "value",
              "purchasesellvalue",
              "netamount",
              "cost",
              "total",
              "grossamount",
            ],
            folioNo: ["foliono", "folio", "folionumber", "accountnumber", "accountno", "folio_no", "folion"],
          };
          let headerRowIndex = -1;
          let columns: Record<string, number> = {};
          for (let i = 0; i < Math.min(50, jsonData.length); i++) {
            const headers = (jsonData[i] || []).map(normalizeHeader);
            const candidateColumns = Object.fromEntries(
              Object.entries(aliases).map(([field, names]) => [
                field,
                headers.findIndex((header) => names.includes(header)),
              ])
            );
            const hasRequired =
              candidateColumns.date >= 0 &&
              candidateColumns.schemeName >= 0 &&
              (candidateColumns.amount >= 0 || (candidateColumns.units >= 0 && candidateColumns.nav >= 0));

            if (hasRequired) {
              headerRowIndex = i;
              columns = candidateColumns;
              foundHeader = true;
              break;
            }
          }

          if (headerRowIndex === -1) continue;

          // Parse data rows
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row) continue;

            const investorName = (columns.investorName >= 0 ? String(row[columns.investorName] ?? "").trim() : "") || "Primary Investor";
            const schemeName = columns.schemeName >= 0 ? String(row[columns.schemeName] ?? "").trim() : "";
            const transactionDate = columns.date >= 0 ? row[columns.date] : null;
            if (!schemeName && !transactionDate) continue;

            const parseNumber = (value: unknown) => {
              if (typeof value === "number") return Number.isFinite(value) ? value : null;
              const text = String(value ?? "")
                .trim()
                .replace(/[₹$€£,\s]/g, "");
              if (!text) return null;
              const isNegative = text.startsWith("(") && text.endsWith(")");
              const parsed = Number(isNegative ? text.slice(1, -1) : text);
              return Number.isFinite(parsed) ? (isNegative ? -parsed : parsed) : null;
            };
            let units = columns.units >= 0 ? parseNumber(row[columns.units]) : null;
            let nav = columns.nav >= 0 ? parseNumber(row[columns.nav]) : null;
            let amount = columns.amount >= 0 ? parseNumber(row[columns.amount]) : null;

            // Auto-compute missing values
            if (amount === null && units !== null && nav !== null) {
              amount = units * nav;
            }
            if (nav === null && amount !== null && units !== null && units !== 0) {
              nav = Math.abs(amount / units);
            }
            if (units === null && amount !== null && nav !== null && nav !== 0) {
              units = Math.abs(amount / nav);
            }

            let date = "";
            if (transactionDate instanceof Date && !Number.isNaN(transactionDate.getTime())) {
              date = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, "0")}-${String(transactionDate.getDate()).padStart(2, "0")}`;
            } else if (typeof transactionDate === "number") {
              const parts = XLSX.SSF.parse_date_code(transactionDate);
              if (parts) {
                date = `${parts.y}-${String(parts.m).padStart(2, "0")}-${String(parts.d).padStart(2, "0")}`;
              }
            } else {
              const text = String(transactionDate ?? "").trim();
              const dayFirst = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
              if (dayFirst) {
                const [, day, month, year] = dayFirst;
                const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
                if (
                  parsed.getUTCFullYear() === Number(year) &&
                  parsed.getUTCMonth() === Number(month) - 1 &&
                  parsed.getUTCDate() === Number(day)
                ) {
                  date = parsed.toISOString().slice(0, 10);
                }
              } else {
                const parsed = new Date(text);
                if (!Number.isNaN(parsed.getTime())) {
                  date = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
                }
              }
            }

            if (
              !schemeName ||
              !date ||
              units === null ||
              nav === null ||
              amount === null
            ) {
              continue;
            }
            const typeIndex = columns.transactionType;
            const folioIndex = columns.folioNo;
            transactions.push({
              transactionType: typeIndex >= 0 ? String(row[typeIndex] ?? "").trim() : "Purchase",
              investorName,
              date,
              schemeName,
              units: Math.abs(units),
              nav,
              amount: Math.abs(amount),
              folioNo: folioIndex >= 0 ? String(row[folioIndex] ?? "").trim() : "",
            });
          }
        }

        if (!foundHeader) {
          throw new Error(
            "Could not find transaction columns. Include Investor Name, Date, Scheme Name, Units, NAV, and Amount."
          );
        }
        if (transactions.length === 0) {
          throw new Error("No valid transaction rows were found in this workbook.");
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
