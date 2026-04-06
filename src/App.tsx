import { QueryProvider } from "./providers/QueryProvider";
import { LanguageProvider } from "./providers/LanguageProvider";
import { ThemeProvider } from "./theme-provider";
import AppRouter from "./router/AppRouter";
import { useAppBootstrap } from "./shared/hooks/useAppBootstrap";
import { useAuthTokenRefresh } from "./shared/hooks/useAuthTokenRefresh";
import { Toaster } from "./shared/components/ui/sonner";

export default function App() {
  useAppBootstrap();
  useAuthTokenRefresh();

  return (
    <LanguageProvider>
      <ThemeProvider>
        <QueryProvider>
          <div className="min-h-screen">
            <AppRouter />
          </div>
          <Toaster />
        </QueryProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
