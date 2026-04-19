export interface BootstrapPlatform {
  loadingMessage: string;
  defaultErrorMessage: string;
  retryLabel: string;
  logRefreshCacheError: (error: unknown) => void;
  logStartupError: (error: unknown) => void;
}
