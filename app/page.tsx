import ContentSection from "@/components/content-4";
import FAQsTwo from "@/components/faqs-2";
import Features from "@/components/features-4";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-8";
import Navigation from "./components/ui/Navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <main>
      <Navigation session={session} />
      <HeroSection />
      <ContentSection />
      <Features />
      <IntegrationsSection />
      <FAQsTwo />
      <FooterSection />
    </main>
  );
}
