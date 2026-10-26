import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, FileSpreadsheet, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as XLSX from "xlsx";

export const ASSET_TYPES = [
  { value: "mutual_funds", label: "Mutual Funds" },
  { value: "stocks", label: "Stocks" },
  { value: "gold", label: "Gold" },
  { value: "real_estate", label: "Real Estate" },
  { value: "flats", label: "Flats" },
  { value: "rental_properties", label: "Rental Properties" },
  { value: "cars", label: "Cars" },
  { value: "liabilities", label: "Liabilities" },
];

interface UploadFormProps {
  parsing: boolean;
  uploadProgress: number;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
  isUploading: boolean;
  hasParsedData: boolean;
  parsedDataLength: number;
  users: { id: string; full_name?: string | null; email: string }[];
  selectedUsers: string[];
  toggleUserSelection: (userId: string) => void;
  selectedAssetType: string;
  setSelectedAssetType: (value: string) => void;
  children?: React.ReactNode; // For the preview component
}

export const UploadForm = ({
  parsing,
  uploadProgress,
  handleFileChange,
  handleUpload,
  isUploading,
  hasParsedData,
  parsedDataLength,
  users,
  selectedUsers,
  toggleUserSelection,
  selectedAssetType,
  setSelectedAssetType,
  children,
}: UploadFormProps) => {
  const handleDownloadSample = () => {
    const sampleData = [
      {
        "Date": "2024-01-15",
        "Investor Name": "Anand Sharma",
        "Scheme Name": "HDFC Top 100 Fund - Growth",
        "Transaction Type": "Purchase",
        "Units": 150.523,
        "NAV": 664.35,
        "Amount": 100000,
        "Folio No": "1002345678",
      },
      {
        "Date": "2024-02-15",
        "Investor Name": "Anand Sharma",
        "Scheme Name": "ICICI Prudential Bluechip Fund - Growth",
        "Transaction Type": "SIP",
        "Units": 85.241,
        "NAV": 586.58,
        "Amount": 50000,
        "Folio No": "1009876543",
      },
      {
        "Date": "2024-03-20",
        "Investor Name": "Anand Sharma",
        "Scheme Name": "SBI Small Cap Fund - Regular Growth",
        "Transaction Type": "Purchase",
        "Units": 120.000,
        "NAV": 125.50,
        "Amount": 15060,
        "Folio No": "1005544332",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "mutual_fund_transactions_sample.xlsx");
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Transaction File
          </CardTitle>
          <CardDescription>Supported formats: Excel (.xlsx, .xls) and CSV files</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadSample}
          className="gap-1.5 text-xs font-semibold rounded-lg self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          Sample Template (.xlsx)
        </Button>
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
            disabled={parsing || isUploading}
          />
        </div>

        {parsing && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing file...
          </div>
        )}

        {children}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        <Button onClick={handleUpload} disabled={!hasParsedData || isUploading} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {hasParsedData ? parsedDataLength : ""} Transactions
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
