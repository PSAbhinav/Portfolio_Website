"use client";
import { useCopy } from "@/components/PortfolioContext";
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

// Section order is the story: what I build now (explained, not listed), every
// project once, what proves it, who I am, what I use, how I got here, contact.
export default function Portfolio() {
  const copy = useCopy();
  return (
    <>
      <a className="skip-link" href="#main">
        {copy("skip_to_content", "Skip to content")}
      </a>
      <Header />
      <main id="main">
        <Hero />
        <FieldGuide />
        <Gallery />
        <Credentials />
        <About />
        <Toolkit />
        <Journey />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
