"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Si falla el registro (navegador sin soporte, contexto no seguro...), la app
      // sigue funcionando con normalidad — el service worker es solo una mejora.
    });
  }, []);

  return null;
}
