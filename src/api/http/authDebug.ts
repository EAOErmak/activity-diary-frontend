export function debugAuthFlow(
  event: string,
  details?: Record<string, unknown>
) {
  if (!import.meta.env.DEV) {
    return;
  }

  if (details) {
    console.debug(`[auth] ${event}`, details);
    return;
  }

  console.debug(`[auth] ${event}`);
}
