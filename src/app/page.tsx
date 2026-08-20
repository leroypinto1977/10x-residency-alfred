import Background from "@/components/Background";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Room from "@/components/sections/Room";
import Film from "@/components/sections/Film";
import Transformation from "@/components/sections/Transformation";
import Location from "@/components/sections/Location";
import Mentor from "@/components/sections/Mentor";
import Features from "@/components/sections/Features";
import Outcomes from "@/components/sections/Outcomes";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import UrgencySection from "@/components/sections/urgency";
import alfredPortrait from "../../public/alfred.jpg";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Background />
      <main className="relative z-[1]">
        {/* Order mirrors the sibling residency site's arc: hook, then the
            film as proof, then what changes, then where it happens, then
            who runs it — objections (FAQ) last, right before the ask. */}
        <Hero />
        <Room />
        <Film />
        <Transformation />
        <Location />
        <Mentor portraitSrc={alfredPortrait} />
        <Outcomes />
        <Features />
        <UrgencySection />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
