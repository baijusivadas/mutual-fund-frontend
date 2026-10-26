import { useState, useMemo, useCallback, memo } from "react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseExcel, ParsedTransaction } from "@/utils/excelParser";
import { UploadForm } from "@/components/upload/UploadForm";
import { UploadPreview } from "@/components/upload/UploadPreview";
import { PageHeader } from "@/components/shared/PageHeader";

interface UploadResult {
  total: number;
  purchases: number;
  redemptions: number;
  skipped: number;
  mappedUsers: number;
}

const VALID_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
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
      const response = await api.get("/auth/users");
      return response.data?.data || response.data || [];
    },
  });

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (!VALID_FILE_TYPES.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel (.xlsx, .xls) or CSV file",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setParsing(true);

      try {
        const data = await parseExcel(selectedFile);
        setParsedData(data);
        toast({
          title: "File parsed successfully",
          description: `Found ${data.length} transactions ready for ingestion.`,
        });
      } catch (err) {
        toast({
          title: "Parse error",
          description: "Failed to read the spreadsheet. Check columns and formatting.",
          variant: "destructive",
        });
      } finally {
        setParsing(false);
      }
    },
    [toast]
  );

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("asset_type", selectedAssetType);

      // Backend reads req.body.selectedUsers (JSON string)
      if (selectedUsers.length > 0) {
        formData.append("selectedUsers", JSON.stringify(selectedUsers));
      }

      const result: UploadResult = { total: 0, purchases: 0, redemptions: 0, skipped: 0, mappedUsers: 0 };

      const response = await api.post("/transaction", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        },
      });

      result.total = response.data?.count ?? 0;
      result.purchases = response.data?.purchases ?? 0;
      result.redemptions = response.data?.redemptions ?? 0;
      result.skipped = response.data?.skipped ?? 0;
      result.mappedUsers = response.data?.mappedUsers ?? 0;
      return result;
    },
    onSuccess: async (result) => {
      // Invalidate all portfolio and transaction related queries across the application
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries({ queryKey: ["user-investments"] });

      toast({
        title: "Upload complete",
        description: `Successfully imported ${result.total} transactions (${result.purchases} purchases, ${result.redemptions} redemptions). The portfolio data has been updated.`,
      });

      setFile(null);
      setParsedData([]);
      setUploadProgress(0);
      setSelectedUsers([]);
    },
    onError: (err: unknown) => {
      toast({
        title: "Upload failed",
        description: getErrorMessage(err, "Upload failed"),
        variant: "destructive",
      });
    },
  });

  const { purchaseCount, redemptionCount } = useMemo(() => {
    let p = 0;
    for (const t of parsedData) {
      if (!/redemption|switch[\s-]*out|sell/i.test(t.transactionType)) {
        p++;
      }
    }
    return {
      purchaseCount: p,
      redemptionCount: parsedData.length - p,
    };
  }, [parsedData]);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }, []);

  const handleUploadSubmit = useCallback(() => {
    uploadMutation.mutate();
  }, [uploadMutation]);

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Data Upload"
        description="Ingest portfolio statement spreadsheets (.xlsx, .xls, .csv) with automatic ledger parsing"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <Alert className="rounded-2xl border-border/60 bg-card/85 backdrop-blur-xl">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
            Supported columns in file: <span className="font-semibold text-foreground">TransactionType, InvestorName, Date, SchemeName, Units, NAV, Amount, FolioNo</span>
          </AlertDescription>
        </Alert>

        <UploadForm
          parsing={parsing}
          uploadProgress={uploadProgress}
          handleFileChange={handleFileChange}
          handleUpload={handleUploadSubmit}
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
    </div>
  );
};

export default memo(DataUpload);
