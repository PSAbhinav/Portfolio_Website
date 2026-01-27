'use client'

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Timeline from '@/components/Timeline'
import Projects from '@/components/Projects'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import ProfessionalBackground from '@/components/ProfessionalBackground'
import { motion } from 'framer-motion'
import { FaChevronDown } from 'react-icons/fa'

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

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen relative text-white bg-black">
      {/* Professional Animated Background */}
      <ProfessionalBackground />

      <Navbar />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="flex flex-col items-center justify-center h-screen text-center px-6 py-20 relative overflow-hidden z-10"
      >

        {/* Animated Name with Gradient */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 font-mono relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="gradient-text">
            {displayText}
          </span>
          <motion.span
            className="text-blue-400"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            |
          </motion.span>
        </motion.h1>

        {/* Tagline with staggered word reveal and blur effect */}
        <motion.p
          className="text-xl md:text-2xl max-w-3xl text-center flex flex-wrap justify-center leading-relaxed text-gray-300 relative z-10"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.03,
                delayChildren: 0.8,
              },
            },
          }}
        >
          {"From game-changing AI Bots to productivity-enhancing applications, explore how I blend creativity with code."
            .split(" ")
            .map((word, wordIndex) => (
              <motion.span
                key={wordIndex}
                className="mr-2 inline-block"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 20,
                    filter: "blur(10px)",
                    scale: 0.8
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    scale: 1,
                    transition: {
                      type: "spring",
                      damping: 12,
                      stiffness: 100
                    }
                  },
                }}
              >
                {word}
              </motion.span>
            ))}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex gap-4 mt-10 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <motion.a
            href="#projects"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold text-white btn-glow ripple"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View My Work
          </motion.a>
          <motion.a
            href="#contact"
            className="px-8 py-3 border-2 border-white/30 rounded-full font-semibold text-white glass glass-hover"
            whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.6)" }}
            whileTap={{ scale: 0.95 }}
          >
            Get In Touch
          </motion.a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer z-10"
          onClick={scrollToAbout}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="flex flex-col items-center text-gray-400 hover:text-white transition-colors"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-sm mb-2">Scroll to explore</span>
            <FaChevronDown className="text-xl" />
          </motion.div>
        </motion.div>
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
