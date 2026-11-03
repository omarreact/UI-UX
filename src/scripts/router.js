/**
 * Softly client-side navigation.
 * Browser-native SPA behavior on top of independently renderable static HTML.
 * No framework, hydration dependency, or API service required.
 *
 * A direct visit, reload, or JavaScript-disabled session still receives the
 * complete HTML document for the requested route.
 */
const NAVIGATION_EVENT = "site:navigated";
const CACHE_LIMIT = 12;
const CACHE_AGE_MS = 2 * 60 * 1000;
const cache = new Map();
const scrollMemory = new Map();
const announcer = document.createElement("span");
announcer.className = "spa-route-announcer";
announcer.setAttribute("role", "status");
announcer.setAttribute("aria-live", "polite");
announcer.setAttribute("aria-atomic", "true");
document.body.appendChild(announcer);

let navSequence = 0;
let entryNumber = 0;
let visiblePage = location.pathname + location.search;
const createKey = () => "softly-" + Date.now().toString(36) + "-" + (++entryNumber);
let currentKey = history.state?.softlyKey || createKey();

const initialState = {
  ...((history.state && typeof history.state === "object") ? history.state : {}),
  softlyKey: currentKey,
  scrollX: history.state?.scrollX ?? window.scrollX,
  scrollY: history.state?.scrollY ?? window.scrollY
};
history.replaceState(initialState, "", location.href);
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function rememberScroll() {
  scrollMemory.set(currentKey, { x: window.scrollX, y: window.scrollY });
  if (history.state?.softlyKey === currentKey) {
    history.replaceState(
      { ...history.state, scrollX: window.scrollX, scrollY: window.scrollY },
      "",
      location.href
    );
  }
}

function eligibleLink(anchor) {
  if (!anchor || anchor.hasAttribute("download") ||
      anchor.getAttribute("target") && anchor.getAttribute("target") !== "_self" ||
      anchor.getAttribute("rel")?.split(/\s+/).includes("external")) return null;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return null;
  const url = new URL(href, location.href);
  if (!["http:", "https:"].includes(url.protocol) || url.origin !== location.origin ||
      url.pathname.startsWith("/assets/") ||
      /\.(?:pdf|webp|png|jpe?g|svg|ico|zip|xml|txt|css|js)$/i.test(url.pathname)) return null;
  return url;
}

function rememberPage(key, html) {
  cache.delete(key);
  cache.set(key, { html, created: Date.now() });
  while (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
}

async function fetchPage(url) {
  const key = url.pathname + url.search;
  const stored = cache.get(key);
  if (stored && Date.now() - stored.created < CACHE_AGE_MS) return stored.html;
  if (stored) cache.delete(key);
  const response = await fetch(key, {
    headers: { Accept: "text/html", "X-Softly-Navigation": "1" },
    credentials: "same-origin"
  });
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
    throw Error("Route unavailable: " + response.status);
  }
  const html = await response.text();
  if (!html.includes('id="main-content"') || !html.includes('class="top-shell"')) {
    throw Error("Invalid route document");
  }
  rememberPage(key, html);
  return html;
}

const headSelectors = [
  'meta[name="description"]',
  'meta[property="og:type"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:url"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'link[rel="canonical"]'
];

function replacePage(html) {
  const next = new DOMParser().parseFromString(html, "text/html");
  if (!next.body?.dataset.page || !next.querySelector("main#main-content") ||
      !next.querySelector(".top-shell") || !next.querySelector("footer") ||
      !next.title.trim()) throw Error("Malformed page");
  const pairs = [
    [".top-shell", ".top-shell"],
    ["main#main-content", "main#main-content"],
    ["footer", "footer"]
  ];
  for (const [current, replacement] of pairs) {
    const oldElement = document.querySelector(current);
    const newElement = next.querySelector(replacement);
    if (!oldElement || !newElement) throw Error("Missing page region " + current);
    oldElement.replaceWith(document.importNode(newElement, true));
  }
  document.body.dataset.page = next.body.dataset.page;
  document.title = next.title;
  for (const selector of headSelectors) {
    const oldElement = document.head.querySelector(selector);
    const newElement = next.head.querySelector(selector);
    if (oldElement && newElement) oldElement.replaceWith(document.importNode(newElement, true));
  }
  document.dispatchEvent(new CustomEvent(NAVIGATION_EVENT, {
    detail: { path: location.pathname, page: document.body.dataset.page }
  }));
}

function restorePosition(url, mode, savedState) {
  const anchorId = url.hash ? decodeURIComponent(url.hash.slice(1)) : "";
  if (anchorId) {
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }
  }
  if (mode === "pop") {
    const remembered = scrollMemory.get(currentKey);
    const x = remembered?.x ?? savedState?.scrollX ?? 0;
    const y = remembered?.y ?? savedState?.scrollY ?? 0;
    window.scrollTo(x, y);
  } else {
    window.scrollTo(0, 0);
  }
}

async function navigate(url, mode = "push", state = null) {
  const routeKey = url.pathname + url.search;
  if (routeKey === visiblePage) {
    if (mode === "pop") {
      currentKey = state?.softlyKey || currentKey;
      requestAnimationFrame(() => restorePosition(url, mode, state));
    }
    return;
  }
  const requestId = ++navSequence;
  const main = document.querySelector("main#main-content");
  if (main) main.setAttribute("aria-busy", "true");
  document.body.dataset.routing = "loading";
  try {
    const html = await fetchPage(url);
    if (requestId !== navSequence) return;
    if (mode === "push") {
      rememberScroll();
      currentKey = createKey();
      history.pushState({ softlyKey: currentKey, scrollX: 0, scrollY: 0 }, "", url.href);
    } else {
      currentKey = state?.softlyKey || createKey();
    }
    replacePage(html);
    visiblePage = routeKey;
    requestAnimationFrame(() => {
      restorePosition(url, mode, state);
      const newMain = document.getElementById("main-content");
      if (newMain) {
        newMain.setAttribute("tabindex", "-1");
        newMain.focus({ preventScroll: true });
      }
      announcer.textContent = document.title + " loaded";
    });
  } catch (error) {
    console.warn("Softly SPA navigation fallback:", url.pathname, error);
    if (requestId === navSequence) {
      // Never strand the visitor when client navigation fails.
      if (mode === "pop") location.replace(url.href);
      else location.assign(url.href);
    }
  } finally {
    if (requestId === navSequence) {
      document.body.removeAttribute("data-routing");
      document.querySelector("main#main-content")?.removeAttribute("aria-busy");
    }
  }
}

document.addEventListener("click", event => {
  if (event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.target.closest?.("a[href]");
  const url = eligibleLink(anchor);
  if (!url) return;
  if (url.pathname + url.search === visiblePage) return; // native hash navigation
  event.preventDefault();
  void navigate(url);
});

window.addEventListener("popstate", event => {
  // The URL has already changed. Scroll positions are remembered by entry.
  scrollMemory.set(currentKey, { x: window.scrollX, y: window.scrollY });
  void navigate(new URL(location.href), "pop", event.state);
});

// Lightweight, bounded hover/focus prefetch. Disabled on data-saving networks.
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
if (!connection?.saveData && !["slow-2g", "2g"].includes(connection?.effectiveType)) {
  let lastPrefetched = "";
  const prefetch = event => {
    const url = eligibleLink(event.target.closest?.("a[href]"));
    if (!url) return;
    const key = url.pathname + url.search;
    if (key === visiblePage || key === lastPrefetched || cache.has(key)) return;
    lastPrefetched = key;
    void fetchPage(url).catch(() => {});
  };
  document.addEventListener("pointerover", prefetch, { passive: true });
  document.addEventListener("focusin", prefetch);
}

// Preserve scroll positions on back/forward, without creating new history entries.
let scrollScheduled = false;
window.addEventListener("scroll", () => {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    if (document.body.dataset.routing !== "loading") rememberScroll();
    scrollScheduled = false;
  });
}, { passive: true });
window.addEventListener("pagehide", rememberScroll);
