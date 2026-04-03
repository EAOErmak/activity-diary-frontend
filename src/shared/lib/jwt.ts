type JwtPayload = {
  exp?: number;
};

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      "="
    );

    return atob(padded);
  } catch {
    return null;
  }
}

export function parseJwtPayload(
  token: string | null | undefined
): JwtPayload | null {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  const decoded = decodeBase64Url(payload);
  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenExpirationMs(
  token: string | null | undefined
): number | null {
  const exp = parseJwtPayload(token)?.exp;

  return typeof exp === "number" ? exp * 1000 : null;
}

export function isTokenExpired(
  token: string | null | undefined,
  skewMs = 0
): boolean {
  const expirationMs = getTokenExpirationMs(token);

  if (expirationMs === null) {
    return true;
  }

  return expirationMs <= Date.now() + skewMs;
}
