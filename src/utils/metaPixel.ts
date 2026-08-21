const META_PIXEL_ID = "1321098516763010";

type FacebookPixel = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: FacebookPixel;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: FacebookPixel;
    _fbq?: FacebookPixel;
  }
}

// Lazily injects the Meta Pixel base script + init call — mirrors the snippet
// already used in the landing page's root layout. Safe to call multiple times;
// a no-op once the pixel is already loaded.
export const loadMetaPixel = () => {
  if (window.fbq) return;

  const fbq: FacebookPixel = (...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document
    .getElementsByTagName("script")[0]
    ?.parentNode?.insertBefore(
      script,
      document.getElementsByTagName("script")[0],
    );

  fbq("init", META_PIXEL_ID);
};

// Loads the pixel (if needed) and fires a PageView — call once on mount of
// any page that should be tracked as a visit.
export const trackMetaPixelPageView = () => {
  loadMetaPixel();
  window.fbq?.("track", "PageView");
};
