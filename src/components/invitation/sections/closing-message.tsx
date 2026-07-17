export function ClosingMessageSection({ text }: { text: string }) {
  return (
    <section className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-xl leading-relaxed italic opacity-80">{text}</p>
    </section>
  );
}
