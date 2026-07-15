"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Wizard guiado",
    text: "14 pasos que convierten la información de vuestra boda en una invitación lista para enviar, sin tocar código.",
  },
  {
    title: "RSVP en tiempo real",
    text: "Panel de confirmaciones, restricciones alimentarias y acompañantes, siempre actualizado.",
  },
  {
    title: "Mesas visuales",
    text: "Arrastra y suelta invitados sobre el plano del salón. Capacidad y colores configurables.",
  },
  {
    title: "Multi-evento",
    text: "El mismo motor sirve para bodas, comuniones, bautizos, cumpleaños y eventos corporativos.",
  },
  {
    title: "Envíos flexibles",
    text: "WhatsApp, email o enlace directo — con código QR único por invitado.",
  },
  {
    title: "100% en capa gratuita",
    text: "Arquitectura pensada para funcionar por completo sobre planes gratuitos de infraestructura.",
  },
];

const TEMPLATES = ["Minimalista", "Elegante", "Boho", "Vintage", "Luxury", "Floral"];

const PLANS = [
  {
    name: "Esencial",
    price: "Gratis",
    tagline: "Para empezar a diseñar",
    items: ["1 evento activo", "Hasta 50 invitados", "3 plantillas", "RSVP básico"],
  },
  {
    name: "Celebración",
    price: "Gratis",
    tagline: "El más elegido",
    items: ["Eventos ilimitados", "Invitados ilimitados", "Todas las plantillas", "Mesas, regalos y álbum"],
    highlighted: true,
  },
  {
    name: "Wedding Planner",
    price: "Gratis",
    tagline: "Para profesionales",
    items: ["Multi-cliente", "Roles y colaboradores", "Analytics avanzado", "Marca blanca básica"],
  },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="caracteristicas" className="mx-auto max-w-6xl px-6 py-28">
      <FadeIn>
        <p className="font-body text-xs uppercase tracking-[0.35em] text-gold-dark">Características</p>
        <h2 className="mt-4 max-w-xl font-display text-4xl md:text-5xl">
          Todo lo que necesitáis, en un solo lugar.
        </h2>
      </FadeIn>

      <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
        {FEATURES.map((f, i) => (
          <FadeIn key={f.title} delay={i * 0.05}>
            <div className="border-t border-ink/15 pt-5">
              <h3 className="font-display text-2xl">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{f.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

export function TemplatesSection() {
  return (
    <section id="plantillas" className="border-y border-ink/10 bg-ink py-28 text-parchment">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-gold-light">Plantillas</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl md:text-5xl">
            Un estilo distinto para cada historia.
          </h2>
        </FadeIn>

        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3">
          {TEMPLATES.map((t, i) => (
            <FadeIn key={t} delay={i * 0.06}>
              <div className="group relative flex aspect-[3/4] items-end overflow-hidden border border-parchment/15 p-5 transition-colors hover:border-gold-light">
                <span className="font-display text-2xl">{t}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="precios" className="mx-auto max-w-6xl px-6 py-28">
      <FadeIn>
        <p className="font-body text-xs uppercase tracking-[0.35em] text-gold-dark">Precios</p>
        <h2 className="mt-4 max-w-xl font-display text-4xl md:text-5xl">
          Sin sorpresas. Sin tarjeta.
        </h2>
      </FadeIn>

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((plan, i) => (
          <FadeIn key={plan.name} delay={i * 0.08}>
            <div
              className={`flex h-full flex-col rounded-sm border p-8 ${
                plan.highlighted ? "border-gold-dark bg-ink text-parchment" : "border-ink/15"
              }`}
            >
              <p
                className={`font-body text-xs uppercase tracking-[0.3em] ${
                  plan.highlighted ? "text-gold-light" : "text-gold-dark"
                }`}
              >
                {plan.tagline}
              </p>
              <h3 className="mt-3 font-display text-3xl">{plan.name}</h3>
              <p className="mt-2 font-display text-2xl">{plan.price}</p>
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className={plan.highlighted ? "text-gold-light" : "text-gold-dark"}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contacto" className="border-t border-ink/10 px-6 py-28">
      <div className="mx-auto max-w-xl text-center">
        <FadeIn>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-gold-dark">Contacto</p>
          <h2 className="mt-4 font-display text-4xl">¿Tenéis alguna pregunta?</h2>
          <p className="mt-4 text-ink/65">Escribidnos y os respondemos en menos de 24h.</p>
          <form className="mt-10 flex flex-col gap-4 text-left">
            <input
              type="email"
              placeholder="Vuestro email"
              className="border-b border-ink/25 bg-transparent py-3 outline-none placeholder:text-ink/40 focus:border-gold-dark"
            />
            <textarea
              placeholder="Mensaje"
              rows={4}
              className="border-b border-ink/25 bg-transparent py-3 outline-none placeholder:text-ink/40 focus:border-gold-dark"
            />
            <button className="mt-4 self-start rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark">
              Enviar mensaje
            </button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
}
