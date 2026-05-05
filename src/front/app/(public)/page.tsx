import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import ProblemSection from "@/components/home/ProblemSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import StatsSection from "@/components/home/StatsSection";
import CtaSection from "@/components/home/CtaSection";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <StatsSection />
      <CtaSection />
      <Footer />
    </>
  );
}
