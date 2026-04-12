const AUTH_BASE_PATH = "/api/auth";

export const AUTH_ENDPOINTS = {
  register: `${AUTH_BASE_PATH}/register`,
  login: `${AUTH_BASE_PATH}/login`,
  refresh: `${AUTH_BASE_PATH}/refresh`,
  logout: `${AUTH_BASE_PATH}/logout`,
} as const;

export function isAuthEndpoint(url?: string) {
  if (!url) {
    return false;
  }

  return Object.values(AUTH_ENDPOINTS).some((endpoint) =>
    url.includes(endpoint)
  );
}
