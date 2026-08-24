import Background from "@/components/Background";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Room from "@/components/sections/Room";
import Film from "@/components/sections/Film";
import PhotoWall from "@/components/sections/PhotoWall";
import Transformation from "@/components/sections/Transformation";
import Location from "@/components/sections/Location";
import Mentor from "@/components/sections/Mentor";
import Features from "@/components/sections/Features";
import Outcomes from "@/components/sections/Outcomes";
import GroupChat from "@/components/sections/GroupChat";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import UrgencySection from "@/components/sections/urgency";
import alfredPortrait from "../../public/alfred.jpg";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Background />
      <main className="relative z-[1]">
        {/* Hook, then the room, then who runs it — the mentor is the reason
            to trust everything that follows, so he lands before the film and
            the promise rather than after them. Then proof, what changes, and
            where it happens; objections (FAQ) last, right before the ask. */}
        <Hero />
        <Room />
        <Mentor portraitSrc={alfredPortrait} />
        <Film />
        {/* Testimonials make the claim; the wall is the receipt. Photographs
            of the actual room land straight after the people describing it,
            while the claim is still fresh, and before Transformation starts
            explaining what changes. */}
        <PhotoWall />
        <Transformation />
        <Location />
        <Outcomes />
        {/* Outcomes says what a founder walks out with; this says it was
            still true weeks later. Deliberately kept well clear of PhotoWall
            — both are drifting photographs, and back to back the second one
            would read as the same idea twice. */}
        <GroupChat />
        <Features />
        <UrgencySection />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
