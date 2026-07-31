import { describe, it, expect } from "vitest";
import { buildIcsContent, toIcsDate } from "@/lib/ics";

describe("toIcsDate", () => {
  it("da formato UTC compacto (YYYYMMDDTHHMMSSZ)", () => {
    const date = new Date("2027-06-14T18:30:00.000Z");
    expect(toIcsDate(date)).toBe("20270614T183000Z");
  });
});

describe("buildIcsContent", () => {
  const base = {
    title: "Laura & Marcos",
    startDate: "2027-06-14",
    startTime: "18:00",
    uid: "test-uid",
    now: new Date("2027-01-01T00:00:00.000Z"),
  };

  it("incluye los campos obligatorios del formato VCALENDAR", () => {
    const ics = buildIcsContent(base);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("SUMMARY:Laura & Marcos");
  });

  it("calcula DTEND sumando la duración por defecto (4 horas) a DTSTART", () => {
    const ics = buildIcsContent(base);
    expect(ics).toContain("DTSTART:20270614T180000Z");
    expect(ics).toContain("DTEND:20270614T220000Z");
  });

  it("respeta una duración personalizada", () => {
    const ics = buildIcsContent({ ...base, durationHours: 6 });
    expect(ics).toContain("DTEND:20270615T000000Z");
  });

  it("omite DESCRIPTION y LOCATION si no se aportan (no deja líneas vacías)", () => {
    const ics = buildIcsContent(base);
    expect(ics).not.toContain("DESCRIPTION:");
    expect(ics).not.toContain("LOCATION:");
  });

  it("incluye DESCRIPTION y LOCATION cuando sí se aportan", () => {
    const ics = buildIcsContent({ ...base, description: "Boda", location: "Madrid" });
    expect(ics).toContain("DESCRIPTION:Boda");
    expect(ics).toContain("LOCATION:Madrid");
  });

  it("usa las 12:00 como hora por defecto si no se especifica startTime", () => {
    const ics = buildIcsContent({ ...base, startTime: null });
    expect(ics).toContain("DTSTART:20270614T120000Z");
  });
});
