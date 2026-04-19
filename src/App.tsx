import { QueryProvider } from "./providers/QueryProvider";
import { LanguageProvider } from "./providers/LanguageProvider";
import { ThemeProvider } from "./theme-provider";
import AppRouter from "./router/AppRouter";
import { Button } from "./shared/components/ui/button";
import { Toaster } from "./shared/components/ui/sonner";
import { useAppBootstrap } from "./shared/hooks/useAppBootstrap";
import { bootstrap, runtime } from "./platform";

function AppBootstrapFallback({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">{runtime.appName}</h1>
        <p className="mt-3 text-sm text-mutedForeground">{message}</p>
        <Button className="mt-6 w-full" onClick={runtime.reload}>
          {bootstrap.retryLabel}
        </Button>
      </div>
    </div>
  );
}

export default function App() {
  const { status, error } = useAppBootstrap();

  return (
    <LanguageProvider>
      <ThemeProvider>
        <QueryProvider>
          <div className="min-h-screen">
            {status === "loading" ? (
              <AppBootstrapFallback message={bootstrap.loadingMessage} />
            ) : status === "error" ? (
              <AppBootstrapFallback
                message={error ?? bootstrap.defaultErrorMessage}
              />
            ) : (
              <AppRouter />
            )}
          </div>
          <Toaster />
        </QueryProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
