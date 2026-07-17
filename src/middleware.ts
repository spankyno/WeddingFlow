import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Todo lo que cuelga de (dashboard) y las rutas de API de gestión requieren sesión.
// La landing (marketing) y la invitación pública (/i/...) quedan siempre abiertas.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/eventos(.*)",
  "/api/events(.*)",
  "/api/guests(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
