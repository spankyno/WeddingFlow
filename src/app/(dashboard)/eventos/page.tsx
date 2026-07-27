import { redirect } from "next/navigation";

// El dashboard ya es el listado de eventos; esta ruta existe solo porque el menú lateral
// enlaza a "/eventos" como entrada propia ("Mis eventos"), así que redirige sin duplicar
// la página.
export default function EventsIndexPage() {
  redirect("/dashboard");
}
