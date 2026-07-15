import { Hero } from "@/components/marketing/hero";
import {
  FeaturesSection,
  TemplatesSection,
  PricingSection,
  ContactSection,
} from "@/components/marketing/sections";

export default function MarketingHomePage() {
  return (
    <main>
      <Hero />
      <FeaturesSection />
      <TemplatesSection />
      <PricingSection />
      <ContactSection />
    </main>
  );
}
