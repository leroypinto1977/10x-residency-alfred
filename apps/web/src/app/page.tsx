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
import SeatFee from "@/components/sections/SeatFee";
import UrgencySection from "@/components/sections/urgency";
import alfredPortrait from "../../public/alfred_joshua.png";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Background />
      <main className="relative z-[1]">
        <Hero />
        <Room />
        <Features />
        <Outcomes />
        <Mentor portraitSrc={alfredPortrait} />
        <Film />
        <Location />
        <GroupChat />
        <PhotoWall />
        <SeatFee />
        {/* <Transformation /> */}
        {/* <UrgencySection /> */}
        
        <FAQ />
        {/* <FinalCTA /> */}
      </main>
      <Footer />
    </div>
  );
}
