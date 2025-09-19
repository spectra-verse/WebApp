import ContentSection from "@/components/content-4";
import FAQsTwo from "@/components/faqs-2";
import Features from "@/components/features-4";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-8";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ContentSection />
      <Features />
      <IntegrationsSection />
      <FAQsTwo />
      <FooterSection />
    </main>
  );
}
