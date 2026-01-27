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
import { Upload, Loader2, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    users: any[];
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
    return (
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

                <Button
                    onClick={handleUpload}
                    disabled={!hasParsedData || isUploading}
                    className="w-full"
                >
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
