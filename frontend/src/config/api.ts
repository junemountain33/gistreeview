// Central API base URL. Uses Vite env var VITE_API_BASE_URL.
// If empty, client will request relative to current origin (useful when frontend and backend share domain).
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export function apiUrl(path: string) {
  // ensure path begins with /
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE}${path}`;
}
