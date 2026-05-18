import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, UploadCloud, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

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
    hideHeader?: boolean;
}

import { PageHeader } from "@/components/shared/PageHeader";
import { getAdvancedQueryKey } from "@/hooks/useAdvancedPortfolio";
import { propertyQueryConfig } from "@/hooks/useQueryConfig";

export function DataManager<T extends { id: string; [key: string]: any }>({
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
    transformPayload,
    hideHeader = false
}: DataManagerProps<T>) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState(defaultFormData);

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { token } = useAuth();

    const { data: items = [], isLoading } = useQuery({
        queryKey: getAdvancedQueryKey(entity),
        queryFn: async () => {
            const response = await api.get(`/advanced/${entity}`);
            // Advanced API might be paginated
            return Array.isArray(response.data) ? response.data : (response.data.data || []);
        },
        enabled: !!token,
        ...propertyQueryConfig,
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            const finalPayload = transformPayload ? transformPayload(payload) : payload;

            if (editingItem) {
                const response = await api.put(`/advanced/${entity}/${editingItem.id}`, finalPayload);
                return response.data;
            } else {
                const response = await api.post(`/advanced/${entity}`, finalPayload);
                return response.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdvancedQueryKey(entity) });
            toast({ title: editingItem ? "Item updated" : "Item created" });
            setDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to save data";
            toast({ title: "Error", description: message, variant: "destructive" });
        },
    });

    const handleDelete = async (id: string) => {
        try {
            setDeleting(id);
            await api.delete(`/advanced/${entity}/${id}`);
            queryClient.invalidateQueries({ queryKey: getAdvancedQueryKey(entity) });
            toast({ title: "Item deleted" });
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || "Failed to delete item";
            toast({ title: "Error", description: message, variant: "destructive" });
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

            const response = await api.post(`/advanced/${entity}/${editingItem.id}/upload`, formDataUpload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const result = response.data;
            setFormData(prev => ({ ...prev, document_url: result.document_url }));
            queryClient.invalidateQueries({ queryKey: getAdvancedQueryKey(entity) });
            toast({ title: "Success", description: "Document uploaded successfully!" });
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || "Upload failed";
            toast({ title: "Upload Failed", description: message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const renderDialogContent = () => (
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
    );

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {!hideHeader && (
                <PageHeader 
                    title={title}
                    description={description}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleExport} disabled={!items.length}>
                                <Download className="mr-2 h-4 w-4" /> Export
                            </Button>
                            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Add New</Button>
                                </DialogTrigger>
                                {renderDialogContent()}
                            </Dialog>
                        </div>
                    }
                />
            )}

            {hideHeader && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{title}</h2>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleExport} disabled={!items.length}>
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add New</Button>
                            </DialogTrigger>
                            {renderDialogContent()}
                        </Dialog>
                    </div>
                </div>
            )}
            
            <Card className="glass-card border-none shadow-lg">
                <CardContent className="pt-6">
                    <CommonTable<T>
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
