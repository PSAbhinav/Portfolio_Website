'use client'

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Timeline from '@/components/Timeline'
import Projects from '@/components/Projects'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'

export default function Home() {
  const fullText = "Hi, I'm P S Abhinav Krishna"
  const [displayText, setDisplayText] = useState('')
  const [index, setIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isInView, setIsInView] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.3 }
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isInView) return

    const typingSpeed = isDeleting ? 50 : 100
    const pauseTime = 2000

    const timeout = setTimeout(() => {
      if (!isDeleting && index < fullText.length) {
        setDisplayText((prev) => prev + fullText[index])
        setIndex((prev) => prev + 1)
      } else if (!isDeleting && index === fullText.length) {
        setTimeout(() => setIsDeleting(true), pauseTime)
      } else if (isDeleting && index > 0) {
        setDisplayText((prev) => prev.slice(0, -1))
        setIndex((prev) => prev - 1)
      } else if (isDeleting && index === 0) {
        setIsDeleting(false)
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [index, isDeleting, isInView])

  return (
    <main className="min-h-screen relative text-white bg-black">
      <Navbar />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-br from-black via-neutral-900 to-black px-6 py-20 relative overflow-hidden"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-4 font-mono">
          {displayText}
          <span className="animate-pulse">|</span>
        </h1>
        <motion.p
          className="text-xl md:text-2xl max-w-2xl text-center flex flex-wrap justify-center leading-relaxed"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.02,
                delayChildren: 1.2,
              },
            },
          }}
        >
          {"From game-changing AI Bots to productivity-enhancing applications, explore how I blend creativity with code."
            .split(" ")
            .map((word, wordIndex) => (
              <span key={wordIndex} className="flex">
                {word.split("").map((char, charIndex) => (
                  <motion.span
                    key={`${wordIndex}-${charIndex}`}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.8 }}
                    className="whitespace-pre"
                  >
                    {char}
                  </motion.span>
                ))}
                {/* Add space after each word */}
                <motion.span
                  key={`space-${wordIndex}`}
                  className="whitespace-pre"
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {" "}
                </motion.span>
              </span>
            ))}
        </motion.p>

      </section>

      <About />
      <Skills />
      <Timeline />
      <Projects />
      <Contact />
      <Footer />
    </main>
  )
}
