import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { PipelineShowcase } from "@/components/landing/PipelineShowcase";
import { LeadForm } from "@/components/landing/LeadForm";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PipelineShowcase />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}
