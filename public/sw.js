const CACHE_NAME = "karaji-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

async function injectLanguageBridge(response, pathname) {
  if (!response || !response.ok) return response;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const script = pathname.startsWith("/legal")
    ? `<script>(function(){try{var l=localStorage.getItem("karajy-language")==="ar"?"ar":"en";document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr";var a=document.getElementById("arContent"),e=document.getElementById("enContent"),na=document.getElementById("navAr"),ne=document.getElementById("navEn");if(a)a.classList.toggle("hidden",l!=="ar");if(e)e.classList.toggle("hidden",l==="ar");if(na)na.classList.toggle("hidden",l!=="ar");if(ne)ne.classList.toggle("hidden",l==="ar");var b=document.getElementById("backBtn"),bt=document.getElementById("backText");if(b)b.href="/";if(bt)bt.textContent=l==="ar"?"العودة إلى كراجي":"Back to Karaji";}catch(_){}})();</script>`
    : `<script>(function(){try{if(localStorage.getItem("karajy-language")==="ar"){var b=document.getElementById("arBtn");if(b)b.click();}}catch(_){}})();</script>`;

  return new Response(
    html.replace("</body>", script + "</body>"),
    { status: response.status, statusText: response.statusText, headers: response.headers }
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        const url = new URL(event.request.url);
        if (event.request.mode === "navigate" && (url.pathname.startsWith("/legal") || url.pathname.startsWith("/free-garage"))) {
          return injectLanguageBridge(response, url.pathname);
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
