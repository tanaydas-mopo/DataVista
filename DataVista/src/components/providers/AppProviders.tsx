"use client";

import { useEffect } from "react";
import { AuthProvider } from "../auth/AuthProvider";
import { DatasetProvider } from "../../context/DatasetContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  // Initialize saved theme preference on boot
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("datavista_theme");
      if (savedTheme) {
        document.documentElement.classList.remove("dark", "extra-dark", "cobalt-dark");
        if (savedTheme !== "light") {
          document.documentElement.classList.add(savedTheme);
        }
      }
    } catch {
      // Ignore storage errors on boot
    }
  }, []);

  return (
    <AuthProvider>
      <DatasetProvider>
        {children}
      </DatasetProvider>
    </AuthProvider>
  );
}
