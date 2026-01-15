function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, ""); // remove trailing slash
}

export function getApiBaseUrl() {
  const env = (import.meta.env.VITE_ENV || "LOCALHOST").toUpperCase();

  const map: Record<string, string | undefined> = {
    LOCALHOST: import.meta.env.VITE_LOCAL_BASE_URL,
    STAGING: import.meta.env.VITE_RENDER_BASE_URL,
    RENDER: import.meta.env.VITE_RENDER_BASE_URL,
    AWS: import.meta.env.VITE_AWS_FRONT_BASE_URL,
    VERCEL: import.meta.env.VITE_VERCEL_BASE_URL,
  };

  const base = map[env] || import.meta.env.VITE_LOCAL_BASE_URL;

  if (!base) {
    throw new Error("API base URL is missing. Check your VITE_*_BASE_URL env variables.");
  }

  return normalizeBaseUrl(base);
}

export function apiUrl(path: string) {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
