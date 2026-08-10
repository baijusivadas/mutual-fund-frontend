import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
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
      const response = await api.get("/auth/users");
      return response.data?.data || response.data || [];
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
      const result: UploadResult = { total: parsedData.length, purchases: 0, redemptions: 0, errors: [] };
      if (!file) throw new Error("No file selected");
      
      const formData = new FormData();
      formData.append("file", file);
      if (selectedUsers.length > 0 && selectedAssetType === "mutual_funds") {
        formData.append("selectedUsers", JSON.stringify(selectedUsers));
      }
      
      setUploadProgress(0);
      const response = await api.post("/transaction", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        },
      });

      // Backend returns count of inserted records
      result.total = response.data?.count || 0;
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
      <PageHeader 
        title="Data Upload" 
        description="Upload Excel or CSV files to auto-analyze and update portfolio data" 
      />
      <div className="max-w-4xl mx-auto space-y-6">

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
