"use client";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import FieldGuide from "@/components/site/FieldGuide";
import Gallery from "@/components/site/Gallery";
import Credentials from "@/components/site/Credentials";
import About from "@/components/site/About";
import Toolkit from "@/components/site/Toolkit";
import Journey from "@/components/site/Journey";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";
import SignalCanvas from "@/components/motion/SignalCanvas";
import Choreography from "@/components/motion/Choreography";
import Cursor from "@/components/motion/Cursor";
import Intro from "@/components/motion/Intro";

// Section order is the story: what I build now (explained, not listed), every
// project once, what proves it, who I am, what I use, how I got here, contact.
export default function Portfolio() {
  const copy = useCopy();
  const { settings } = usePortfolio();
  return (
    <>
      <a className="skip-link" href="#main">
        {copy("skip_to_content", "Skip to content")}
      </a>
      {settings.showIntro && <Intro />}
      <SignalCanvas />
      <Choreography />
      {settings.showCursor && <Cursor />}
      <Header />
      <main id="main">
        <Hero />
        <About />
        <FieldGuide />
        <Gallery />
        <Credentials />
        <Toolkit />
        <Journey />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
