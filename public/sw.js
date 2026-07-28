// Service worker deliberadamente conservador: solo cachea los assets estáticos generados
// por Next.js (JS/CSS con hash en el nombre, seguros de cachear indefinidamente) y los
// iconos. Todo lo demás (páginas, /api/*, la invitación pública, el RSVP...) pasa siempre
// por red — nunca se sirve contenido dinámico ni desactualizado desde caché.

const CACHE_NAME = "weddingflow-static-v1";
const STATIC_PATH_PREFIXES = ["/_next/static/", "/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

function isCacheableStaticAsset(url) {
  return STATIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET" || !isCacheableStaticAsset(url)) {
    return; // deja pasar la petición sin interceptar (comportamiento normal de red)
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      const response = await fetch(event.request);
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    })
  );
});
