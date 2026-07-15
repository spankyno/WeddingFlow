export function StorySection({ text }: { text: string }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="font-body text-xs uppercase tracking-[0.35em] text-gold-dark">
        Nuestra historia
      </p>
      <p className="mt-8 font-display text-2xl leading-relaxed text-ink/80">{text}</p>
    </section>
  );
}
