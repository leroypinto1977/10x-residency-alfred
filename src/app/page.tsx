import Background from "@/components/Background";
import Logo from "@/components/Logo";
import MobileStickyBar from "@/components/MobileStickyBar";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Transformation from "@/components/sections/Transformation";
import Mentor from "@/components/sections/Mentor";
import Features from "@/components/sections/Features";
import Outcomes from "@/components/sections/Outcomes";
import SocialProof from "@/components/sections/SocialProof";
import FinalCTA from "@/components/sections/FinalCTA";
import UrgencySection from "@/components/sections/urgency";
import AdminLead from "@/components/sections/AdminLead";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Background />
      {/* <Logo /> */}
      <main className="relative z-[1]">
        <Hero />
        <Transformation />
        <Mentor portraitSrc="/alfred.jpg" />
        <Outcomes />
        <Features />
        <SocialProof />
        <UrgencySection/>
        <FinalCTA />
      </main>
      <Footer />
      <MobileStickyBar />
    </div>
  );
}
