import React from "react";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./theme-provider";
import AppRouter from "./router/AppRouter";
import { useSyncInit } from "@/shared/hooks/useSyncState";

export default function App() {
  useSyncInit();
  return (
    <ThemeProvider>
      <QueryProvider>
        <div className="min-h-screen">
          <AppRouter />
        </div>
      </QueryProvider>
    </ThemeProvider>
  );
}
