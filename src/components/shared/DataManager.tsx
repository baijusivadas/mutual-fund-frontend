import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, UploadCloud, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CommonTable, ColumnConfig } from "@/components/CommonTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface DataManagerProps<T> {
    entity: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    columns: ColumnConfig<T>[];
    searchKeys: (keyof T)[];
    emptyMessage: string;
    defaultFormData: Record<string, any>;
    renderForm: (formData: any, setFormData: (data: any) => void) => React.ReactNode;
    statusKey?: keyof T;
    statusFilters?: { label: string; value: string }[];
    transformPayload?: (data: any) => any;
}

export function DataManager<T extends { id: string }>({
    entity,
    title,
    description,
    icon,
    columns,
    searchKeys,
    emptyMessage,
    defaultFormData,
    renderForm,
    statusKey,
    statusFilters,
    transformPayload
}: DataManagerProps<T>) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState(defaultFormData);

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { token } = useAuth();

    const fetchHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    const { data: items = [], isLoading } = useQuery({
        queryKey: [entity],
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URL}/api/advanced/${entity}`, {
                headers: fetchHeaders
            });
            if (!response.ok) throw new Error("Failed to fetch data");
            return response.json();
        },
        enabled: !!token,
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            const finalPayload = transformPayload ? transformPayload(payload) : payload;

            let response;
            if (editingItem) {
                response = await fetch(`${BACKEND_URL}/api/advanced/${entity}/${editingItem.id}`, {
                    method: "PUT",
                    headers: fetchHeaders,
                    body: JSON.stringify(finalPayload)
                });
            } else {
                response = await fetch(`${BACKEND_URL}/api/advanced/${entity}`, {
                    method: "POST",
                    headers: fetchHeaders,
                    body: JSON.stringify(finalPayload)
                });
            }

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || err.message || "Failed to save data");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [entity] });
            toast({ title: editingItem ? "Item updated" : "Item created" });
            setDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const handleDelete = async (id: string) => {
        try {
            setDeleting(id);
            const response = await fetch(`${BACKEND_URL}/api/advanced/${entity}/${id}`, {
                method: "DELETE",
                headers: fetchHeaders
            });
            if (!response.ok) throw new Error("Failed to delete item");

            queryClient.invalidateQueries({ queryKey: [entity] });
            toast({ title: "Item deleted" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setDeleting(null);
        }
    };

    const resetForm = () => {
        setFormData(defaultFormData);
        setEditingItem(null);
    };

    const openEditDialog = (item: T) => {
        setEditingItem(item);
        setFormData({ ...defaultFormData, ...item });
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        mutation.mutate(formData);
    };

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(items);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, title);
        XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_Export.xlsx`);
        toast({ title: "Export Started", description: `Downloading ${title} data as Excel.` });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!editingItem) {
            toast({ title: "Save First", description: "You must save the item before uploading a document to it.", variant: "destructive" });
            return;
        }

        try {
            setUploading(true);
            const formDataUpload = new FormData();
            formDataUpload.append("document", file);

            const response = await fetch(`${BACKEND_URL}/api/advanced/${entity}/${editingItem.id}/upload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }, // No Content-Type, let browser set boundary
                body: formDataUpload
            });

            if (!response.ok) throw new Error("Document upload failed");

            const result = await response.json();
            setFormData(prev => ({ ...prev, document_url: result.document_url }));
            queryClient.invalidateQueries({ queryKey: [entity] });
            toast({ title: "Success", description: "Document uploaded successfully!" });
        } catch (error: any) {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold flex items-center gap-2">
                                {icon}
                                {title}
                            </CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleExport} disabled={!items.length}>
                                <Download className="mr-2 h-4 w-4" /> Export
                            </Button>
                            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Add New</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
                                        <DialogDescription>{editingItem ? "Update item details" : "Add a new item to your portfolio"}</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        {renderForm(formData, setFormData)}

                                        {editingItem && (
                                            <div className="grid gap-2 border-t pt-4 mt-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium">Supporting Document</p>
                                                        <p className="text-xs text-muted-foreground">Upload invoice or loan paper (PDF/Img)</p>
                                                    </div>
                                                    {formData.document_url && (
                                                        <a href={`${BACKEND_URL}${formData.document_url}`} target="_blank" rel="noreferrer"
                                                            className="text-xs flex items-center gap-1 text-primary hover:underline">
                                                            <FileText className="h-4 w-4" /> View Current
                                                        </a>
                                                    )}
                                                </div>
                                                <Button variant="outline" className="w-full relative" disabled={uploading}>
                                                    {uploading ? <LoadingSpinner /> : <><UploadCloud className="mr-2 h-4 w-4" /> {formData.document_url ? "Replace Document" : "Upload Document"}</>}
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={handleFileUpload}
                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                        disabled={uploading}
                                                    />
                                                </Button>
                                            </div>
                                        )}
                                        {!editingItem && (
                                            <div className="text-xs text-muted-foreground text-center border-t pt-4 mt-2">
                                                * You can upload documents (invoices/PDFs) after saving this item.
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleSubmit}>{editingItem ? "Update" : "Create"}</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CommonTable
                        data={items}
                        columns={columns}
                        onEdit={openEditDialog}
                        onDelete={handleDelete}
                        searchPlaceholder={`Search ${title.toLowerCase()}...`}
                        searchKeys={searchKeys}
                        statusKey={statusKey}
                        statusFilters={statusFilters}
                        emptyMessage={emptyMessage}
                        deletingId={deleting}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
