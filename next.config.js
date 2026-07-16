/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Las imágenes se sirven desde R2 vía un dominio propio; se añaden aquí los remotePatterns reales
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
};

// Habilita en `next dev` el acceso a los bindings reales de Cloudflare (D1, R2...)
// tal y como se comportarán en producción, vía Miniflare.
if (process.env.NODE_ENV === "development") {
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}

module.exports = nextConfig;
