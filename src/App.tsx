import React from "react";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./components/theme-provider";
import AppRouter from "./router/AppRouter";

export default function App() {
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
