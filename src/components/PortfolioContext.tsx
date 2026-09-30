"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { PortfolioContent } from "@/lib/content-schema";

const PortfolioContext = createContext<PortfolioContent | null>(null);

export function PortfolioProvider({ content, children }: { content: PortfolioContent; children: ReactNode }) {
  return <PortfolioContext.Provider value={content}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioContent {
  const value = useContext(PortfolioContext);
  if (!value) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return value;
}

// Copy lookup with a literal fallback so a missing key never renders "undefined".
export function useCopy(): (key: string, fallback: string) => string {
  const { copy } = usePortfolio();
  return (key, fallback) => copy[key] ?? fallback;
}
