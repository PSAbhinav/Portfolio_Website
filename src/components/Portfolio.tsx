"use client";
import { useCopy } from "@/components/PortfolioContext";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import Now from "@/components/site/Now";
import Work from "@/components/site/Work";
import Credentials from "@/components/site/Credentials";
import About from "@/components/site/About";
import Toolkit from "@/components/site/Toolkit";
import Journey from "@/components/site/Journey";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";

// Section order is the story: who I am now, what I shipped, what proves it,
// who I am, what I use, how I got here, how to reach me.
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
        <Now />
        <Work />
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
