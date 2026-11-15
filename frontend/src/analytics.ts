declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

let enabled = false;
let ready = false;
const pending: [string, Record<string, string>][] = [];

function gtag(..._args: unknown[]) {
  // gtag.js requires the Arguments object, not an array
  window.dataLayer.push(arguments);
}

export async function initAnalytics() {
  try {
    const res = await fetch("/api/config");
    const { gaMeasurementId } = (await res.json()) as { gaMeasurementId: string | null };
    if (!gaMeasurementId) return;
    window.dataLayer = window.dataLayer || [];
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", gaMeasurementId, { send_page_view: false });
    enabled = true;
    pending.splice(0).forEach(([n, p]) => gtag("event", n, p));
  } catch {
    // analytics must never break the UI
  } finally {
    ready = true;
    pending.length = 0;
  }
}

export function trackEvent(name: string, params: Record<string, string> = {}) {
  if (enabled) gtag("event", name, params);
  else if (!ready) pending.push([name, params]); // buffered until config loads
}

export function trackPageView(view: string) {
  trackEvent("page_view", { page_title: view, page_path: `/${view}` });
}
