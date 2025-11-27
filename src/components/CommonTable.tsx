import { useState, useMemo, ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Search, Loader2, ArrowUpDown } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PaginationControls } from "./PaginationControls";
import { BulkActionBar } from "./BulkActionBar";

export interface ColumnConfig<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface FilterConfig {
  value: string;
  label: string;
}

interface CommonTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnConfig<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkStatusUpdate?: (ids: string[], status: string) => void;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  statusKey?: keyof T;
  statusFilters?: FilterConfig[];
  emptyMessage?: string;
  deletingId?: string | null;
  showBulkActions?: boolean;
  showCheckboxes?: boolean;
}

export function CommonTable<T extends { id: string; [key: string]: any }>({
  data,
  columns,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkStatusUpdate,
  searchPlaceholder = "Search...",
  searchKeys = [],
  statusKey,
  statusFilters = [],
  emptyMessage = "No items found",
  deletingId,
  showBulkActions = false,
  showCheckboxes = false,
}: CommonTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = searchKeys.length === 0 || searchKeys.some((key) => {
        const value = item[key];
        return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });

      const matchesStatus =
        !statusKey ||
        statusFilter === "all" ||
        item[statusKey] === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter, searchKeys, statusKey]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginatedData.map((item) => item.id) : []);
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };

  const handleBulkDeleteInternal = () => {
    onBulkDelete?.(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkStatusUpdateInternal = (status: string) => {
    onBulkStatusUpdate?.(selectedIds, status);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {searchKeys.length > 0 && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        )}

        {statusFilters.length > 0 && statusKey && (
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {showBulkActions && onBulkDelete && onBulkStatusUpdate && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          onBulkDelete={handleBulkDeleteInternal}
          onBulkStatusUpdate={handleBulkStatusUpdateInternal}
          statusOptions={statusFilters.filter((f) => f.value !== "all")}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {showCheckboxes && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedIds.length === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                      {column.label}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length + (showCheckboxes ? 1 : 0) + (onEdit || onDelete ? 1 : 0)
                  }
                  className="text-center text-muted-foreground"
                >
                  {searchQuery || statusFilter !== "all"
                    ? "No items match your filters"
                    : emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id}>
                  {showCheckboxes && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) =>
                          handleSelectItem(item.id, checked as boolean)
                        }
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render
                        ? column.render(item)
                        : item[column.key]?.toString() || "-"}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                disabled={deletingId === item.id}
                              >
                                {deletingId === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this item. This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedData.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={sortedData.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}

export function getBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    available: "default",
    in_stock: "default",
    sold: "secondary",
    rented: "secondary",
    pending: "outline",
    reserved: "outline",
    maintenance: "outline",
  };
  return variants[status] || "default";
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={getBadgeVariant(status)} className="capitalize">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}