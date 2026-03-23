'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation, useInView, useMotionValue, useSpring } from 'framer-motion'
import Image from 'next/image'

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-100px', amount: 0.2 })
  const controlsImg = useAnimation()
  const controlsText = useAnimation()

  // 3D Tilt effect state
  const [isMounted, setIsMounted] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(0, { stiffness: 150, damping: 20 })
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isInView) {
      controlsImg.start('visible')
      controlsText.start('visible')
    } else {
      controlsImg.start('hidden')
      controlsText.start('hidden')
    }
  }, [isInView, controlsImg, controlsText])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    rotateX.set(mouseY / 10)
    rotateY.set(-mouseX / 10)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <section
      id="about"
      ref={ref}
      className="min-h-screen px-6 md:px-12 lg:px-24 py-32 text-white flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 lg:gap-32 relative overflow-hidden z-10"
    >

      {/* Image section with 3D tilt */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -80, scale: 0.8 },
          visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
              type: "spring",
              stiffness: 100
            },
          },
        }}
        initial="hidden"
        animate={controlsImg}
        className="flex-shrink-0 z-10"
      >
        <motion.div
          ref={imageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: rotateX,
            rotateY: rotateY,
            transformStyle: 'preserve-3d'
          }}
          className="relative cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Animated corner brackets */}
          <div className="absolute -inset-6 pointer-events-none">
            {/* Top left corner */}
            <motion.div
              className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-blue-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Top right corner */}
            <motion.div
              className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-purple-400"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Bottom left corner */}
            <motion.div
              className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-purple-400"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Bottom right corner */}
            <motion.div
              className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-blue-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Outer hexagonal glow */}
          <motion.div
            className="absolute inset-0 -m-4 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
              filter: 'blur(20px)',
            }}
            animate={{
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Scanning line effect */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-20"
          >
            <motion.div
              className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
              animate={{
                top: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>

          {/* Rotating border segments - using SVG for clean rendering */}
          <svg
            className="absolute inset-0 -m-6 w-[calc(100%+48px)] h-[calc(100%+48px)]"
            viewBox="0 0 100 100"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeDasharray="25 25"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '50% 50%' }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="1.5"
              strokeDasharray="15 35"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '50% 50%' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Static border */}
          <div className="absolute inset-0 -m-1 rounded-full border border-white/20" />

          {/* Image container */}
          <motion.div
            className="relative rounded-full overflow-hidden"
            whileHover={{
              boxShadow: "0 0 40px rgba(59, 130, 246, 0.4)"
            }}
          >
            <Image
              src="/Profile_Pic.jpg"
              alt="Profile Picture"
              width={320}
              height={320}
              className="rounded-full border-2 border-white/10 shadow-2xl relative z-10 object-cover transition-all duration-500 group-hover:saturate-110 group-hover:contrast-105"
            />

            {/* Holographic overlay on hover */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%, rgba(139, 92, 246, 0.1) 100%)',
              }}
            />

            {/* Data lines overlay on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-full h-px bg-cyan-400/50"
                  style={{ top: `${(i + 1) * 12}%` }}
                  initial={{ scaleX: 0, originX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Status indicator - positioned below the photo frame */}
          <motion.div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-green-500/30 z-30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-green-400"
              animate={{
                opacity: [1, 0.4, 1],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-green-400 font-medium tracking-wide">Open to Work</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Text section with blur reveal */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 60 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, delay: 0.3, ease: "easeOut" },
          },
        }}
        initial="hidden"
        animate={controlsText}
        className="max-w-2xl text-center md:text-left z-10"
      >
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-6"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}
        >
          About <span className="gradient-text">Me</span>
        </motion.h2>

        <motion.div className="space-y-4">
          {[
            "I’m a Computer Science student who enjoys building practical applications and experimenting with new technologies, especially in AI and full-stack development. I’ve worked on projects across different domains, including a stock prediction platform, AI-based tools, and full-stack applications like task management systems and e-commerce setups.",
            "I focus on building things that go beyond basic prototypes—making them functional, usable, and closer to real-world applications. I’m particularly interested in integrating AI into everyday use cases and improving user experience through clean and intuitive design.",
            "Most of my learning comes from building, breaking, and figuring things out along the way. I’m always looking for opportunities to work on ideas that challenge me and help me grow as a developer."
          ].map((paragraph, index) => (
            <motion.p
              key={index}
              className="text-lg text-gray-300 leading-relaxed text-justify"
              initial={{ opacity: 0, x: -30, filter: "blur(5px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.5,
                delay: 0.2 + index * 0.15,
                ease: "easeOut"
              }}
              viewport={{ once: false }}
            >
              {paragraph}
            </motion.p>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
