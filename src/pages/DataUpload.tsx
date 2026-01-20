import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as XLSX from "xlsx";

interface ParsedTransaction {
  transactionType: string;
  investorName: string;
  date: string;
  schemeName: string;
  units: number;
  nav: number;
  amount: number;
  folioNo: string;
}

interface UploadResult {
  total: number;
  purchases: number;
  redemptions: number;
  errors: string[];
}

const ASSET_TYPES = [
  { value: "mutual_funds", label: "Mutual Funds" },
  { value: "stocks", label: "Stocks" },
  { value: "gold", label: "Gold" },
  { value: "real_estate", label: "Real Estate" },
  { value: "flats", label: "Flats" },
  { value: "rental_properties", label: "Rental Properties" },
  { value: "cars", label: "Cars" },
  { value: "liabilities", label: "Liabilities" },
];

const DataUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAssetType, setSelectedAssetType] = useState<string>("mutual_funds");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users for mapping
  const { data: users = [] } = useQuery({
    queryKey: ["users-for-upload"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const parseExcel = useCallback(async (file: File): Promise<ParsedTransaction[]> => {
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
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setParsing(true);
    setParsedData([]);

    try {
      const data = await parseExcel(selectedFile);
      setParsedData(data);
      toast({
        title: "File parsed successfully",
        description: `Found ${data.length} transactions`,
      });
    } catch (err) {
      toast({
        title: "Error parsing file",
        description: "Could not parse the file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (): Promise<UploadResult> => {
      const result: UploadResult = { total: 0, purchases: 0, redemptions: 0, errors: [] };
      const batchSize = 100;
      const { data: { user } } = await supabase.auth.getUser();

      for (let i = 0; i < parsedData.length; i += batchSize) {
        const batch = parsedData.slice(i, i + batchSize);
        setUploadProgress(Math.round(((i + batch.length) / parsedData.length) * 100));

        for (const txn of batch) {
          const txnType = txn.transactionType.toLowerCase();
          const isSell =
            txnType.includes("redemption") || txnType.includes("switchout") || txn.units < 0;

          const record = {
            transaction_type: txn.transactionType,
            investor_name: txn.investorName,
            date: txn.date,
            scheme: txn.schemeName,
            units: txn.units,
            nav: txn.nav,
            amount: txn.amount,
            folio: txn.folioNo,
          };

          try {
            if (isSell) {
              const { error } = await supabase.from("redemptions").insert(record);
              if (error) throw error;
              result.redemptions++;
            } else {
              const { error } = await supabase.from("purchases").insert(record);
              if (error) throw error;
              result.purchases++;
            }
            result.total++;
          } catch (err: any) {
            result.errors.push(`Row ${i + batch.indexOf(txn) + 1}: ${err.message}`);
          }
        }
      }

      // Auto-map investments to selected users if any selected
      if (selectedUsers.length > 0 && selectedAssetType === "mutual_funds") {
        const uniqueInvestors = [...new Set(parsedData.map((t) => t.investorName))];
        
        for (const userId of selectedUsers) {
          for (const investorName of uniqueInvestors) {
            try {
              await supabase.from("user_investment_mapping").upsert({
                user_id: userId,
                asset_type: selectedAssetType,
                investor_name: investorName,
                created_by: user?.id,
              }, {
                onConflict: "user_id,asset_type,asset_id",
                ignoreDuplicates: true,
              });
            } catch (err) {
              // Ignore duplicate mapping errors
            }
          }
        }
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["raw_transactions"] });
      queryClient.invalidateQueries({ queryKey: ["net-worth"] });
      queryClient.invalidateQueries({ queryKey: ["investment-mappings"] });

      toast({
        title: "Upload complete",
        description: `Processed ${result.total} transactions (${result.purchases} purchases, ${result.redemptions} redemptions)${result.errors.length > 0 ? `. ${result.errors.length} errors.` : ""}`,
      });

      setFile(null);
      setParsedData([]);
      setUploadProgress(0);
      setSelectedUsers([]);
    },
    onError: (err: any) => {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const purchaseCount = parsedData.filter((t) => {
    const type = t.transactionType.toLowerCase();
    return !type.includes("redemption") && !type.includes("switchout");
  }).length;

  const redemptionCount = parsedData.length - purchaseCount;

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Data Upload</h1>
          <p className="text-muted-foreground">
            Upload Excel or CSV files to auto-analyze and update portfolio data
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Upload files with columns: TransactionType, InvestorName, Date, SchemeName, Units, NAV,
            Amount, FolioNo
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload Transaction File
            </CardTitle>
            <CardDescription>
              Supported formats: Excel (.xlsx, .xls) and CSV files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Asset Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="asset-type">Asset Type</Label>
              <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {ASSET_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Selection for Auto-Mapping */}
            <div className="space-y-2">
              <Label>Auto-Map to Users (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select users to automatically assign uploaded investments to them
              </p>
              <div className="flex flex-wrap gap-2">
                {users.map((user) => (
                  <Badge
                    key={user.id}
                    variant={selectedUsers.includes(user.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleUserSelection(user.id)}
                  >
                    {user.full_name || user.email}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={parsing || uploadMutation.isPending}
              />
            </div>

            {parsing && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing file...
              </div>
            )}

            {file && parsedData.length > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                    <Badge variant="outline">{parsedData.length} transactions</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-success/10">
                      <p className="text-muted-foreground">Purchases</p>
                      <p className="text-lg font-semibold text-success">{purchaseCount}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10">
                      <p className="text-muted-foreground">Redemptions</p>
                      <p className="text-lg font-semibold text-destructive">{redemptionCount}</p>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Preview (first 5 rows):</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Investor</th>
                            <th className="text-left p-2">Scheme</th>
                            <th className="text-right p-2">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.slice(0, 5).map((txn, i) => (
                            <tr key={i} className="border-b border-dashed">
                              <td className="p-2">{txn.transactionType}</td>
                              <td className="p-2">{txn.investorName}</td>
                              <td className="p-2 truncate max-w-[150px]">{txn.schemeName}</td>
                              <td className="p-2 text-right">
                                ₹{txn.amount.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {uploadMutation.isPending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={!parsedData.length || uploadMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {parsedData.length} Transactions
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DataUpload;
