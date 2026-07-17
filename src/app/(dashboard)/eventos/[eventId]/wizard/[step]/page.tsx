import Link from "next/link";
import { Step1BasicInfo } from "@/components/wizard/steps/step-1-basic-info";
import { Step2Theme } from "@/components/wizard/steps/step-2-theme";
import { Step3Palette } from "@/components/wizard/steps/step-3-palette";
import { Step4Typography } from "@/components/wizard/steps/step-4-typography";
import { Step5Sections } from "@/components/wizard/steps/step-5-sections";
import { Step12RsvpConfig } from "@/components/wizard/steps/step-12-rsvp-config";
import { Step13ClosingMessage } from "@/components/wizard/steps/step-13-closing-message";
import { Step14Preview } from "@/components/wizard/steps/step-14-preview";

const STEP_TITLES: Record<string, string> = {
  "1": "Información básica",
  "2": "Estilo",
  "3": "Paleta",
  "4": "Tipografía",
  "5": "Secciones",
  "6": "Agenda",
  "7": "Dress code",
  "8": "Lista de regalos",
  "9": "Hoteles",
  "10": "Transporte",
  "11": "Preguntas frecuentes",
  "12": "Confirmación de asistencia",
  "13": "Mensaje final",
  "14": "Vista previa",
};

const IMPLEMENTED_STEPS = new Set(["1", "2", "3", "4", "5", "12", "13", "14"]);

// Nota de implementación: los pasos 6-11 (agenda, dress code, regalos, hoteles, transporte,
// FAQ) siguen pendientes — son editores de listas (añadir/editar/eliminar N elementos) en
// vez de un formulario simple, así que se abordan en una iteración dedicada. El resto del
// wizard (incluida la vista previa/publicación del paso 14) ya funciona de punta a punta.
export default async function WizardStepPage({
  params,
}: {
  params: Promise<{ eventId: string; step: string }>;
}) {
  const { eventId, step: stepNumber } = await params;
  const isImplemented = IMPLEMENTED_STEPS.has(stepNumber);

  return (
    <div>
      <p className="font-body text-xs uppercase tracking-widest text-gold-dark">
        Paso {stepNumber} de 14
      </p>
      <h1 className="mt-2 font-display text-4xl">{STEP_TITLES[stepNumber] ?? "Paso"}</h1>

      <div className="mt-10">
        {stepNumber === "1" && <Step1BasicInfo />}
        {stepNumber === "2" && <Step2Theme eventId={eventId} />}
        {stepNumber === "3" && <Step3Palette eventId={eventId} />}
        {stepNumber === "4" && <Step4Typography eventId={eventId} />}
        {stepNumber === "5" && <Step5Sections eventId={eventId} />}
        {stepNumber === "12" && <Step12RsvpConfig eventId={eventId} />}
        {stepNumber === "13" && <Step13ClosingMessage eventId={eventId} />}
        {stepNumber === "14" && <Step14Preview eventId={eventId} />}

        {!isImplemented && (
          <div className="max-w-lg">
            <p className="text-ink/50">
              Este paso todavía no está implementado — se añadirá en una próxima iteración
              siguiendo el mismo patrón que el resto del wizard.
            </p>
            <Link
              href={`/eventos/${eventId}/wizard/12`}
              className="mt-6 inline-block rounded-full border border-ink/20 px-6 py-3 font-body text-sm uppercase tracking-widest text-ink/70 transition-colors hover:border-ink"
            >
              Saltar a confirmación de asistencia (paso 12) →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
