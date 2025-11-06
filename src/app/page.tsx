// import Image from "next/image";
import HeroSection from "@/components/landing-components/hero-section";
import IntroAnimada from "@/components/landing-components/introAnimada";
import ContentSection from "@/components/landing-components/landing-content";
import CallToAction from "@/components/landing-components/call-to-action";
import FooterSection from "@/components/landing-components/footer";
import { HeroHeader } from "@/components/landing-components/hero-header";

export default function Home() {
  return (
    <>
      {/* Esta es la landing page */}
      <IntroAnimada/>

      {/* Primer comando: pnpm i y segundo comando: pnpm dev */}
        <HeroHeader/>
        <HeroSection />
        <ContentSection />
        <CallToAction />
        <FooterSection />
    </>
  );
}
