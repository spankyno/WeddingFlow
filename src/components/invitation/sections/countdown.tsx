"use client";

import { useEffect, useState } from "react";

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
  };
}

export function CountdownSection({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(targetDate)), 60_000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <section className="border-y border-ink/10 py-20 text-center">
      <div className="mx-auto flex max-w-md justify-center gap-10">
        {[
          { label: "Días", value: time.days },
          { label: "Horas", value: time.hours },
          { label: "Minutos", value: time.minutes },
        ].map((unit) => (
          <div key={unit.label}>
            <p className="font-display text-5xl">{unit.value}</p>
            <p className="mt-2 font-body text-xs uppercase tracking-widest text-ink/50">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
