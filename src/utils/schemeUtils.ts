import { Crown, Gem, UserCheck, type LucideIcon } from "lucide-react";
import type { ClientRiskProfile, ClientTier } from "@/types/advisor";

export function classifyScheme(name: string): "equity" | "debt" | "hybrid" {
  const l = name.toLowerCase();
  if (/debt|bond|liquid|income|gilt|money\s?market|short\s?term|ultra\s?short|overnight|credit\s?risk|banking\s?psu|floater|dynamic\s?bond|constant/i.test(l)) return "debt";
  if (/hybrid|balanced|advantage|dynamic\s?asset|multi\s?asset|equity\s?savings|arbitrage|conservative/i.test(l)) return "hybrid";
  return "equity";
}

export function extractAMC(name: string): string {
  const l = name.toLowerCase();
  if (l.includes("sbi")) return "SBI Mutual Fund";
  if (l.includes("icici pru")) return "ICICI Prudential";
  if (l.includes("hdfc")) return "HDFC Mutual Fund";
  if (l.includes("nippon")) return "Nippon India";
  if (l.includes("bandhan")) return "Bandhan Mutual Fund";
  if (l.includes("tata")) return "Tata Mutual Fund";
  if (l.includes("kotak")) return "Kotak Mahindra";
  if (l.includes("axis")) return "Axis Mutual Fund";
  if (l.includes("aditya birla") || l.includes("absl")) return "Aditya Birla Sun Life";
  if (l.includes("mirae")) return "Mirae Asset";
  if (l.includes("uti")) return "UTI Mutual Fund";
  if (l.includes("parag parikh") || l.includes("ppfas")) return "Parag Parikh (PPFAS)";
  if (l.includes("dsp")) return "DSP Mutual Fund";
  if (l.includes("motilal")) return "Motilal Oswal";
  if (l.includes("canara robeco")) return "Canara Robeco";
  if (l.includes("quant")) return "Quant Mutual Fund";
  const words = name.split(" ");
  return words.slice(0, Math.min(2, words.length)).join(" ");
}

export const AMC_COLOR_PALETTE: Record<string, string> = {
  "SBI Mutual Fund": "#2563eb",
  "ICICI Prudential": "#ea580c",
  "HDFC Mutual Fund": "#dc2626",
  "Nippon India": "#0284c7",
  "Bandhan Mutual Fund": "#7c3aed",
  "Tata Mutual Fund": "#0891b2",
  "Kotak Mahindra": "#e11d48",
  "Axis Mutual Fund": "#9333ea",
  "Aditya Birla Sun Life": "#ca8a04",
  "Parag Parikh (PPFAS)": "#059669",
  "Mirae Asset": "#0d9488",
  "DSP Mutual Fund": "#4f46e5",
  "Motilal Oswal": "#f97316",
  "Canara Robeco": "#06b6d4",
  "Quant Mutual Fund": "#16a34a",
};

export function getClientRiskProfile(equityPct: number): ClientRiskProfile {
  if (equityPct >= 75) {
    return {
      label: "Aggressive",
      color: "text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      desc: "High Equity allocation (>75%) for long-term growth",
    };
  }
  if (equityPct >= 40) {
    return {
      label: "Moderate",
      color: "text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      desc: "Balanced mix of Equity & Debt",
    };
  }
  return {
    label: "Conservative",
    color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    desc: "Capital preservation focused",
  };
}

export function getClientTier(val: number): ClientTier {
  if (val >= 5_000_000) return "HNI";
  if (val >= 1_000_000) return "Premium";
  return "Regular";
}

export const TIER_STYLE: Record<ClientTier, { icon: LucideIcon; label: string; fg: string; bg: string }> = {
  HNI: { icon: Crown, label: "HNI", fg: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-500/10" },
  Premium: { icon: Gem, label: "Premium", fg: "text-violet-700 dark:text-violet-300", bg: "bg-violet-50 dark:bg-violet-500/10" },
  Regular: { icon: UserCheck, label: "Regular", fg: "text-sky-700 dark:text-sky-300", bg: "bg-sky-50 dark:bg-sky-500/10" },
};

