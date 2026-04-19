function buildApiBaseUrl(baseUrl: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  if (normalizedBaseUrl.endsWith("/api")) {
    return normalizedBaseUrl;
  }

  return `${normalizedBaseUrl}/api`;
}

export const API_BASE_URL = buildApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:18080"
);
