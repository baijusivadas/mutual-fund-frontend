import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseExcel, ParsedTransaction } from "@/utils/excelParser";
import { UploadForm } from "@/components/upload/UploadForm";
import { UploadPreview } from "@/components/upload/UploadPreview";

interface UploadResult {
  total: number;
  purchases: number;
  redemptions: number;
  errors: string[];
}

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

        <UploadForm
          parsing={parsing}
          uploadProgress={uploadProgress}
          handleFileChange={handleFileChange}
          handleUpload={() => uploadMutation.mutate()}
          isUploading={uploadMutation.isPending}
          hasParsedData={parsedData.length > 0}
          parsedDataLength={parsedData.length}
          users={users}
          selectedUsers={selectedUsers}
          toggleUserSelection={toggleUserSelection}
          selectedAssetType={selectedAssetType}
          setSelectedAssetType={setSelectedAssetType}
        >
          <UploadPreview
            file={file}
            parsedData={parsedData}
            purchaseCount={purchaseCount}
            redemptionCount={redemptionCount}
          />
        </UploadForm>
      </div>
    </DashboardLayout>
  );
};

export default DataUpload;
