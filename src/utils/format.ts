/**
 * Shared formatting utilities for consistent data presentation
 */

/**
 * Format number as Indian Rupee (INR)
 */
export const formatCurrency = (value: number, maximumFractionDigits = 0) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits,
    }).format(value);
};

/**
 * Format number in Indian units (Cr, L)
 */
export const formatIndianUnits = (value: number) => {
    if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)} L`;
    }
    return formatCurrency(value);
};

/**
 * Format date to standard readable string
 */
export const formatDate = (date: string | Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', options);
};

/**
 * Format percentage
 */
export const formatPercent = (value: number | string) => {
    const val = typeof value === 'string' ? parseFloat(value) : value;
    return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
};
