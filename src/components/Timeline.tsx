'use client'

import { useEffect, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { FaGraduationCap, FaSchool } from 'react-icons/fa'
import { MdSchool } from 'react-icons/md'
import { useAnimationTheme } from './ThemeContext'

const roadmapData = [
  {
    title: 'Computer Science Engineering (CSE)',
    place: 'Sai Vidya Institute of technology (SVIT)',
    date: '2022 - 2026',
    icon: <FaGraduationCap size={20} />,
    description: 'Specialized in core CSE concepts and Web-Development. Completed my B.Tech with a CGPA of 8.9.',
    color: 'bg-blue-500',
    gradientColor: 'from-blue-500 to-cyan-400',
  },
  {
    title: 'Higher Secondary School',
    place: 'Narayana PU College',
    date: '2020 - 2022',
    icon: <FaSchool size={20} />,
    description: 'Completed 12th grade with 74+% and a focus on Computer Science and Mathematics.',
    color: 'bg-pink-500',
    gradientColor: 'from-pink-500 to-purple-500',
  },
  {
    title: 'Secondary School',
    place: 'Narayana E-Techno School',
    date: '2013 - 2020',
    icon: <MdSchool size={24} />,
    description: 'Completed 10th grade with 85% and a stronger focus on Mathematics.',
    color: 'bg-emerald-500',
    gradientColor: 'from-emerald-500 to-teal-400',
  }
]

export default function Timeline() {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-100px', amount: 0.2 })
  const controls = useAnimation()
  const { currentTheme } = useAnimationTheme()

  // Theme-based animation values
  const springConfig = {
    stiffness: currentTheme.animation.springStiffness,
    damping: currentTheme.animation.springDamping,
  }

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    } else {
      controls.start('hidden')
    }
  }, [isInView, controls])

  return (
    <section
      id="timeline"
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden z-10"
    >

      <motion.h2
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, type: "spring", stiffness: 100 },
          },
        }}
        initial="hidden"
        animate={controls}
        className="text-4xl md:text-5xl font-bold text-center mb-20 relative z-10"
      >
        My <span className="gradient-text">Journey</span>
      </motion.h2>

      <div className="relative max-w-4xl mx-auto w-full">
        {/* Timeline Line - Animated */}
        <motion.div
          className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full origin-top"
          variants={{
            hidden: { scaleY: 0, opacity: 0 },
            visible: {
              scaleY: 1,
              opacity: 1,
              transition: { duration: 1.5, ease: "easeOut" }
            }
          }}
          initial="hidden"
          animate={controls}
          style={{ height: '100%' }}
        />

        {roadmapData.map((item, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: {
                opacity: 0,
                x: index % 2 === 0 ? -50 : 50,
                y: 20
              },
              visible: {
                opacity: 1,
                x: 0,
                y: 0,
                transition: {
                  duration: 0.8,
                  delay: index * 0.3,
                  type: "spring",
                  stiffness: 80
                },
              },
            }}
            initial="hidden"
            animate={controls}
            className={`relative flex items-start mb-16 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
          >
            {/* Content Card */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`ml-16 md:ml-0 md:w-[calc(50%-40px)] ${index % 2 === 0 ? 'md:mr-auto md:pr-10' : 'md:ml-auto md:pl-10'
                }`}
            >
              <div className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
                {/* Gradient overlay on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradientColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className={`text-sm font-medium bg-gradient-to-r ${item.gradientColor} bg-clip-text text-transparent mb-2`}>
                    {item.place}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">{item.date}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            </motion.div>

            {/* Timeline Dot - synced with card */}
            <motion.div
              className={`absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center rounded-full ${item.color} shadow-lg z-10`}
              variants={{
                hidden: { scale: 0, opacity: 0 },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.3,
                    type: "spring",
                    stiffness: 200
                  }
                }
              }}
              initial="hidden"
              animate={controls}
              whileHover={{ scale: 1.2 }}
            >
              {/* Pulsing glow */}
              <motion.div
                className={`absolute inset-0 rounded-full ${item.color}`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative z-10 text-white">{item.icon}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
