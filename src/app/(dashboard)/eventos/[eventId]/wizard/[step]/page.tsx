import Link from "next/link";
import { Step1BasicInfo } from "@/components/wizard/steps/step-1-basic-info";
import { Step2Theme } from "@/components/wizard/steps/step-2-theme";
import { Step3Palette } from "@/components/wizard/steps/step-3-palette";
import { Step4Typography } from "@/components/wizard/steps/step-4-typography";
import { Step5Sections } from "@/components/wizard/steps/step-5-sections";
import { Step6Agenda } from "@/components/wizard/steps/step-6-agenda";
import { Step7DressCode } from "@/components/wizard/steps/step-7-dress-code";
import { Step8Gifts } from "@/components/wizard/steps/step-8-gifts";
import { Step9Hotels } from "@/components/wizard/steps/step-9-hotels";
import { Step10Transport } from "@/components/wizard/steps/step-10-transport";
import { Step11Faq } from "@/components/wizard/steps/step-11-faq";
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

// El wizard completo (pasos 1-14) ya está implementado end-to-end.
export default async function WizardStepPage({
  params,
}: {
  params: Promise<{ eventId: string; step: string }>;
}) {
  const { eventId, step: stepNumber } = await params;

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
        {stepNumber === "6" && <Step6Agenda eventId={eventId} />}
        {stepNumber === "7" && <Step7DressCode eventId={eventId} />}
        {stepNumber === "8" && <Step8Gifts eventId={eventId} />}
        {stepNumber === "9" && <Step9Hotels eventId={eventId} />}
        {stepNumber === "10" && <Step10Transport eventId={eventId} />}
        {stepNumber === "11" && <Step11Faq eventId={eventId} />}
        {stepNumber === "12" && <Step12RsvpConfig eventId={eventId} />}
        {stepNumber === "13" && <Step13ClosingMessage eventId={eventId} />}
        {stepNumber === "14" && <Step14Preview eventId={eventId} />}
      </div>
    </div>
  );
}
