// Origin of the marketing/landing site (a separate Next.js app) — localhost:3000 in local
// dev, kolabme.com in production. A provider's shareable public profile link lives there
// (/p/:slug), not on this app's own domain.
export const LANDING_SITE_URL =
  (import.meta.env.VITE_ENV || "LOCALHOST").toUpperCase() === "LOCALHOST"
    ? "http://localhost:3000"
    : "https://kolabme.com";
