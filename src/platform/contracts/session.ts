export interface SessionPlatform {
  getAccessToken: () => string | null;
  clearAuth: () => void;
}
