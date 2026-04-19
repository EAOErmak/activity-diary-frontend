import type { BootstrapPlatform } from "@/platform/contracts";

export const webBootstrap: BootstrapPlatform = {
  loadingMessage: "Loading application...",
  defaultErrorMessage: "The application could not be started.",
  retryLabel: "Retry startup",
  logRefreshCacheError(error) {
    console.error("Failed to refresh dictionaries during app bootstrap", error);
  },
  logStartupError(error) {
    console.error("Failed to bootstrap the app", error);
  },
};
