"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { CompanyView } from "../types";

type CompanyViewContextValue = {
  view: CompanyView;
  setView: (view: CompanyView) => void;
};

const CompanyViewContext = createContext<CompanyViewContextValue | null>(null);

export function CompanyViewProvider({
  children,
  initialView,
}: {
  children: ReactNode;
  initialView: CompanyView;
}) {
  const [view, setView] = useState<CompanyView>(initialView);

  return (
    <CompanyViewContext.Provider value={{ view, setView }}>
      {children}
    </CompanyViewContext.Provider>
  );
}

export function useCompanyView() {
  const context = useContext(CompanyViewContext);

  if (!context) {
    throw new Error("useCompanyView must be used within CompanyViewProvider");
  }

  return context;
}
