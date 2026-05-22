import { useState, useMemo, ReactNode, useCallback, memo } from "react";
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
import { VList } from "virtua";

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

// Memoized Row Component for maximum performance
const MemoizedRow = memo(({ 
  item, 
  columns, 
  showCheckboxes, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  deletingId 
}: { 
  item: any; 
  columns: ColumnConfig<any>[]; 
  showCheckboxes?: boolean; 
  isSelected?: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
}) => (
  <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
    {showCheckboxes && (
      <TableCell className="w-12">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(item.id, checked as boolean)}
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
              className="h-8 w-8"
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
                  className="h-8 w-8"
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-card border-none">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this item. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(item.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
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
));

MemoizedRow.displayName = "MemoizedRow";

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
  isLoading?: boolean;
  useVirtualization?: boolean;
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
  isLoading = false,
  useVirtualization = false,
}: CommonTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = useCallback((columnKey: string) => {
    setSortColumn(prev => {
      if (prev === columnKey) {
        setSortDirection(dir => dir === "asc" ? "desc" : "asc");
        return columnKey;
      }
      setSortDirection("asc");
      return columnKey;
    });
  }, []);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const matchesSearch = searchKeys.length === 0 || searchKeys.some((key) => {
        return item[key]?.toString().toLowerCase().includes(query);
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
      
      const comparison = (aValue ?? "") < (bValue ?? "") ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    if (useVirtualization) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, useVirtualization]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedIds(checked ? paginatedData.map((item) => item.id) : []);
  }, [paginatedData]);

  const handleSelectItem = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  }, []);

  const handleBulkDeleteInternal = useCallback(() => {
    onBulkDelete?.(selectedIds);
    setSelectedIds([]);
  }, [onBulkDelete, selectedIds]);

  const handleBulkStatusUpdateInternal = useCallback((status: string) => {
    onBulkStatusUpdate?.(selectedIds, status);
    setSelectedIds([]);
  }, [onBulkStatusUpdate, selectedIds]);

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
              className="pl-10 glass-card border-none"
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
            <SelectTrigger className="w-full md:w-[180px] glass-card border-none">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="glass-card border-none">
              {statusFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value} className="focus:bg-primary/10">
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

      <div className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
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
                <TableHead key={column.key} className={cn("font-bold text-xs uppercase tracking-wider", column.className)}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="-ml-3 h-8 hover:bg-transparent hover:text-primary transition-colors uppercase tracking-widest text-[10px] font-black"
                    >
                      {column.label}
                      <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
                    </Button>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{column.label}</span>
                  )}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest opacity-70">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          {useVirtualization ? (
            <VList key="tbody" style={{ height: '500px' }}>
              {paginatedData.map((item) => (
                <MemoizedRow
                  key={item.id}
                  item={item}
                  columns={columns}
                  showCheckboxes={showCheckboxes}
                  isSelected={selectedIds.includes(item.id)}
                  onSelect={handleSelectItem}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  deletingId={deletingId}
                />
              ))}
            </VList>
          ) : (
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (showCheckboxes ? 1 : 0) + (onEdit || onDelete ? 1 : 0)}
                    className="text-center py-20"
                  >
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (showCheckboxes ? 1 : 0) + (onEdit || onDelete ? 1 : 0)}
                    className="text-center py-20 text-muted-foreground"
                  >
                     <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 opacity-20" />
                      <p className="text-sm font-medium">
                          {searchQuery || statusFilter !== "all" ? "No matches found for your current filters" : emptyMessage}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <MemoizedRow
                      key={item.id}
                      item={item}
                      columns={columns}
                      showCheckboxes={showCheckboxes}
                      isSelected={selectedIds.includes(item.id)}
                      onSelect={handleSelectItem}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      deletingId={deletingId}
                  />
                ))
              )}
            </TableBody>
          )}
        </Table>
      </div>

      {!useVirtualization && sortedData.length > 0 && (
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

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
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
    <Badge variant={getBadgeVariant(status)} className="capitalize rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-wider">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
