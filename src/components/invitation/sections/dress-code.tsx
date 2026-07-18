export function DressCodeSection({
  config,
}: {
  config: { descriptionText: string | null; color1: string | null; color2: string | null; color3: string | null };
}) {
  if (!config.descriptionText && !config.color1) return null;
  const colors = [config.color1, config.color2, config.color3].filter(Boolean) as string[];

  return (
    <section className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.35em] opacity-60">Dress code</p>
      {config.descriptionText && <p className="mt-6 text-lg leading-relaxed">{config.descriptionText}</p>}
      {colors.length > 0 && (
        <div className="mt-6 flex justify-center gap-3">
          {colors.map((c, i) => (
            <span key={i} className="h-8 w-8 rounded-full border border-current/10" style={{ backgroundColor: c }} />
          ))}
        </div>
      )}
    </section>
  );
}
