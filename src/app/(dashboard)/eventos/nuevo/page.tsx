import { Step1BasicInfo } from "@/components/wizard/steps/step-1-basic-info";

export default function NewEventPage() {
  return (
    <div>
      <p className="font-body text-xs uppercase tracking-widest text-gold-dark">Paso 1 de 14</p>
      <h1 className="mt-2 font-display text-4xl">Información básica</h1>
      <div className="mt-10">
        <Step1BasicInfo />
      </div>
    </div>
  );
}
