import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/db/queries/events";
import { ShareButtons } from "@/components/dashboard/share-buttons";

const SECTIONS = [
  { href: "wizard/1", label: "Editar invitación", desc: "Retoma el wizard en cualquier paso" },
  { href: "invitados", label: "Invitados", desc: "Alta manual, import Excel, QR, confirmaciones" },
  { href: "mesas", label: "Mesas", desc: "Editor visual drag & drop de distribución" },
  { href: "galeria", label: "Galería", desc: "Fotos oficiales y vídeo (YouTube/Vimeo)" },
  { href: "musica", label: "Música", desc: "Aprobar o rechazar canciones sugeridas" },
  { href: "album", label: "Álbum", desc: "Moderar fotos subidas por los invitados" },
  { href: "colaboradores", label: "Colaboradores", desc: "Invita a otras personas a ayudarte" },
  { href: "regalos", label: "Lista de regalos", desc: "Se configura desde el wizard, paso 8" },
  { href: "analytics", label: "Analytics", desc: "Visitas, dispositivos y embudo de confirmación" },
];

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicada",
  archived: "Archivada",
};

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) notFound();

  return (
    <div>
      <div className="flex items-center gap-3">
        <p className="font-body text-xs uppercase tracking-widest text-gold-dark">
          {event.eventType}
        </p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs ${
            event.status === "published" ? "bg-sage/20 text-sage" : "bg-ink/10 text-ink/50"
          }`}
        >
          {STATUS_LABEL[event.status] ?? event.status}
        </span>
      </div>
      <h1 className="mt-2 font-display text-4xl">{event.title}</h1>

      {event.status === "published" ? (
        <div className="mt-4">
          <ShareButtons eventSlug={event.slug} title={event.title} />
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink/50">
          Todavía no has publicado esta invitación —{" "}
          <Link
            href={`/eventos/${event.id}/wizard/14`}
            className="text-gold-dark underline underline-offset-4"
          >
            ve al paso 14 del wizard para publicarla
          </Link>
          .
        </p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={`/eventos/${event.id}/${s.href}`}
            className="block rounded-sm border border-ink/15 p-6 transition-colors hover:border-gold-dark"
          >
            <h3 className="font-display text-2xl">{s.label}</h3>
            <p className="mt-1 text-sm text-ink/60">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
