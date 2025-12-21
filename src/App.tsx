import { useEffect, useMemo } from "react";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./theme-provider";
import AppRouter from "./router/AppRouter";
import { useAppBootstrap } from "./shared/hooks/useAppBootstrap";

export default function App() {
  useAppBootstrap();
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
