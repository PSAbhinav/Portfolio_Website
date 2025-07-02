'use client'

import { useEffect, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import Image from 'next/image'

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-100px', amount: 0.2 }) // triggers when 20% is visible
  const controlsImg = useAnimation()
  const controlsText = useAnimation()

  useEffect(() => {
    if (isInView) {
      controlsImg.start('visible')
      controlsText.start('visible')
    } else {
      controlsImg.start('hidden')
      controlsText.start('hidden')
    }
  }, [isInView])

  return (
    <section
      id="about"
      ref={ref}
      className="min-h-screen px-4 py-24 bg-gradient-to-b from-black to-neutral-900 text-white flex flex-col md:flex-row items-center justify-center gap-12 relative overflow-hidden before:absolute before:inset-0 before:z-0 before:bg-gradient-to-br before:from-neutral-800/60 before:via-neutral-900/70 before:to-neutral-800/60 before:animate-diagonalScroll"
    >
      {/* Image section */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -50 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, ease: 'easeOut' },
          },
        }}
        initial="hidden"
        animate={controlsImg}
        className="flex-shrink-0 z-10"
      >
        <Image
          src="/Profile_Pic.png"
          alt="Profile Picture"
          width={250}
          height={250}
          className="rounded-full border-4 border-gray-700 shadow-lg"
        />
      </motion.div>

      {/* Text section */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, delay: 0.2, ease: 'easeOut' },
          },
        }}
        initial="hidden"
        animate={controlsText}
        className="max-w-xl text-center md:text-left z-10"
      >
        <h2 className="text-4xl font-bold mb-4">About Me</h2>
        <p className="text-lg text-gray-300 leading-relaxed">
        I have worked on different domains ranging from AI based Chess Engine to Audio-to-Text Conversion tool to CGPA Calculator. Currently, I am working on an AI-based Recipe Recommendation System combining machine learning techniques with a real-time conversational environment for cooking assistance. I’m all about bringing ideas to life with clean, scalable code and intuitive UX.
        </p>
      </motion.div>
    </section>
  )
}
