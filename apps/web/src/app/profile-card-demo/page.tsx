import ProfileCard from "@/components/ProfileCard";

// Demo route for ProfileCard — kept separate from the real homepage
// (src/app/page.tsx) rather than dropping a fixed demo card into the
// production landing page.
export default function ProfileCardDemoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EDE7DC] p-8">
      <ProfileCard
        name="Alfred Joshua"
        role="Business Operation Specialist"
        subtitle="Co Founder at The GOAT Media."
        followers="500K+"
        imageSrc="/alfred1.png"
        imageAlt="Alfred Joshua, Business Operation Specialist and Co-Founder at The GOAT Media"
      />
    </main>
  );
}
