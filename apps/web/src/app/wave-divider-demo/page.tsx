import WaveDivider from "@/components/WaveDivider";

// Demo route for WaveDivider — kept separate from the real homepage
// (src/app/page.tsx) rather than dropping a standalone example into the
// production landing page. The real usage lives in Footer.tsx.
export default function WaveDividerDemoPage() {
  return (
    <main>
      <section style={{ background: "#f3efe8", padding: "6rem 2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>A cream section</h1>
        <p style={{ marginTop: "0.75rem", maxWidth: "40ch" }}>
          WaveDivider sits at the boundary below, reading as this section&apos;s own cream
          dripping down into the footer rather than a hard edge.
        </p>
      </section>

      <footer style={{ background: "#050505" }}>
        <WaveDivider />
        <div style={{ padding: "4rem 2rem", color: "#f5f3ee" }}>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>A black footer</p>
          <p style={{ marginTop: "0.75rem", maxWidth: "40ch", opacity: 0.7 }}>
            Everything here, including this footer&apos;s own background, uses the same two
            colors passed into WaveDivider — that&apos;s what keeps the seam invisible.
          </p>
        </div>
      </footer>
    </main>
  );
}
