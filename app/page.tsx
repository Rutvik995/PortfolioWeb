import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SelectedWork from "@/components/SelectedWork";
import AgentArchitecture from "@/components/AgentArchitecture";
import TechStack from "@/components/TechStack";
import About from "@/components/About";
import Writing from "@/components/Writing";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <SelectedWork />
        <AgentArchitecture />
        <TechStack />
        <About />
        <Writing />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
