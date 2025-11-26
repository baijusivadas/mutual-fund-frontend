import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdvancedSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statusOptions: { value: string; label: string }[];
  
  // Optional price range filters
  showPriceFilter?: boolean;
  minPrice?: number;
  maxPrice?: number;
  onPriceChange?: (min: number | undefined, max: number | undefined) => void;
  
  // Optional date range filters
  showDateFilter?: boolean;
  startDate?: string;
  endDate?: string;
  onDateChange?: (start: string | undefined, end: string | undefined) => void;
  
  // Optional property type filter
  showPropertyTypeFilter?: boolean;
  propertyType?: string;
  onPropertyTypeChange?: (value: string) => void;
  propertyTypeOptions?: { value: string; label: string }[];
}

export const AdvancedSearchFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions,
  showPriceFilter = false,
  minPrice,
  maxPrice,
  onPriceChange,
  showDateFilter = false,
  startDate,
  endDate,
  onDateChange,
  showPropertyTypeFilter = false,
  propertyType,
  onPropertyTypeChange,
  propertyTypeOptions = [],
}: AdvancedSearchFiltersProps) => {
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || "");

  // Debounced search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch, onSearchChange]);

  // Debounced price filters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onPriceChange) {
        const min = localMinPrice ? parseFloat(localMinPrice) : undefined;
        const max = localMaxPrice ? parseFloat(localMaxPrice) : undefined;
        onPriceChange(min, max);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localMinPrice, localMaxPrice, onPriceChange]);

  const hasActiveFilters = useMemo(() => {
    return (
      statusFilter !== "all" ||
      (minPrice !== undefined && minPrice > 0) ||
      (maxPrice !== undefined && maxPrice > 0) ||
      (startDate !== undefined && startDate !== "") ||
      (endDate !== undefined && endDate !== "") ||
      (propertyType !== undefined && propertyType !== "all")
    );
  }, [statusFilter, minPrice, maxPrice, startDate, endDate, propertyType]);

  const clearFilters = () => {
    setDebouncedSearch("");
    onSearchChange("");
    onStatusChange("all");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    if (onPriceChange) onPriceChange(undefined, undefined);
    if (onDateChange) onDateChange(undefined, undefined);
    if (onPropertyTypeChange) onPropertyTypeChange("all");
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Basic Search Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location..."
                value={debouncedSearch}
                onChange={(e) => setDebouncedSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(showPriceFilter || showDateFilter || showPropertyTypeFilter) && (
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Advanced {hasActiveFilters && `(${Object.values({ statusFilter, minPrice, maxPrice, startDate, endDate, propertyType }).filter(v => v && v !== 'all').length})`}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            )}

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {(showPriceFilter || showDateFilter || showPropertyTypeFilter) && (
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {showPriceFilter && onPriceChange && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="min-price">Min Price</Label>
                        <Input
                          id="min-price"
                          type="number"
                          placeholder="Min price"
                          value={localMinPrice}
                          onChange={(e) => setLocalMinPrice(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-price">Max Price</Label>
                        <Input
                          id="max-price"
                          type="number"
                          placeholder="Max price"
                          value={localMaxPrice}
                          onChange={(e) => setLocalMaxPrice(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {showDateFilter && onDateChange && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate || ""}
                          onChange={(e) => onDateChange(e.target.value, endDate)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate || ""}
                          onChange={(e) => onDateChange(startDate, e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {showPropertyTypeFilter && onPropertyTypeChange && (
                    <div className="space-y-2">
                      <Label htmlFor="property-type">Property Type</Label>
                      <Select value={propertyType || "all"} onValueChange={onPropertyTypeChange}>
                        <SelectTrigger id="property-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
};