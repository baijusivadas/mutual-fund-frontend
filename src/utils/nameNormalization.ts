/**
 * Normalizes investor names by:
 * - Trimming whitespace
 * - Removing extra spaces
 * - Removing trailing punctuation (dots, commas, etc.)
 * - Converting to Title Case
 */
export function normalizeInvestorName(name: string | undefined | null): string | null {
  if (!name) return null;
  
  // Trim and replace multiple spaces with single space
  let normalized = name.trim().replace(/\s+/g, ' ');
  
  // Remove trailing punctuation (dots, commas, semicolons, etc.)
  normalized = normalized.replace(/[.,;:!?\s]+$/, '');
  
  // Convert to Title Case
  normalized = normalized.toLowerCase().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return normalized;
}
