"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink/10">
      {/* Textura de fondo sutil: líneas finas tipo grabado, no gradiente morado genérico */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 64px)",
        }}
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 pb-28 pt-20 md:grid-cols-2 md:pt-32">
        <div className="flex flex-col justify-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 font-body text-xs uppercase tracking-[0.35em] text-gold-dark"
          >
            Invitaciones digitales · Nº 01
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-6xl leading-[1.05] tracking-tight md:text-7xl"
          >
            Vuestra historia,
            <br />
            <em className="italic text-gold-dark">contada</em> con
            <br />
            elegancia.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 max-w-md text-lg leading-relaxed text-ink/70"
          >
            Diseña la invitación de tu boda, comunión o celebración en minutos.
            Confirmaciones, mesas, regalos y recuerdos — todo en un único enlace
            hecho a vuestra medida.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <Link
              href="/sign-up"
              className="group relative overflow-hidden rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark"
            >
              Crear mi invitación
            </Link>
            <Link
              href="#plantillas"
              className="font-body text-sm uppercase tracking-widest text-ink/70 underline decoration-gold-dark decoration-1 underline-offset-8 transition-colors hover:text-ink"
            >
              Ver plantillas
            </Link>
          </motion.div>
        </div>

        {/* Composición asimétrica: tarjeta de invitación "flotando" con rotación ligera */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto flex h-[520px] w-[360px] items-center justify-center self-center rounded-[2px] border border-ink/10 bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)] md:mx-0"
        >
          <div className="absolute inset-4 border border-gold/40" />
          <div className="flex flex-col items-center gap-4 px-8 text-center">
            <span className="font-body text-[10px] uppercase tracking-[0.4em] text-gold-dark">
              Nos casamos
            </span>
            <h2 className="font-display text-4xl leading-tight">
              Laura
              <span className="mx-2 text-gold-dark">&amp;</span>
              Marcos
            </h2>
            <div className="my-2 h-px w-12 bg-gold" />
            <p className="font-body text-xs uppercase tracking-[0.3em] text-ink/60">
              14 · Junio · 2027
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
