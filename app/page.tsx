import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import AgenticWorkflow from "@/components/AgenticWorkflow";
import Skills from "@/components/Skills";
import AIAgentConsole from "@/components/AIAgentConsole";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Neural3DCanvas from "@/components/Neural3DCanvas";

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Neural3DCanvas />
      <Navbar />
      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        <About />
        <section id="architecture" style={{ position: "relative", padding: "100px 0" }}>
          <AgenticWorkflow />
        </section>
        <Projects />
        <Skills />
        <section style={{ position: "relative", padding: "40px 0" }}>
          <AIAgentConsole />
        </section>
        <Contact />
      </main>
      <Footer />
    </>
  );
}
