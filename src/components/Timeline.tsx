'use client'

import { useEffect, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { FaGraduationCap, FaSchool } from 'react-icons/fa'
import { MdSchool } from 'react-icons/md'

const roadmapData = [
  {
    title: 'Computer Science Engineering (CSE)',
    place: 'Sai Vidya Institute of technology (SVIT)',
    date: '2022 - 2026',
    icon: <FaGraduationCap size={20} />,
    description: 'Specialized in core CSE concepts and Web-Development. Currently in 3rd year with CGPA of 8.9.',
    color: 'bg-blue-500',
  },
  {
    title: 'Higher Secondary School',
    place: 'Narayana PU College',
    date: '2020 - 2022',
    icon: <FaSchool size={20} />,
    description: 'Completed 12th grade with 74+% and a focus on Computer Science and Mathematics.',
    color: 'bg-pink-500',
  },
  {
    title: 'Secondary School',
    place: 'Narayana E-Techno School',
    date: '2013 - 2020',
    icon: <MdSchool size={24} />,
    description: 'Completed 10th grade with 85% and a stronger focus on Mathematics.',
    color: 'bg-emerald-500',
  }  
]

export default function Timeline() {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-100px', amount: 0.2 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    } else {
      controls.start('hidden')
    }
  }, [isInView])

  return (
    <section
      id="timeline"
      ref={ref}
      className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-tl from-neutral-950 via-neutral-900 to-neutral-950 px-6 py-20 relative overflow-hidden"
    >
      <motion.h2
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
          },
        }}
        initial="hidden"
        animate={controls}
        className="text-4xl font-bold text-center mb-16"
      >
        My Roadmap
      </motion.h2>

      <div className="relative max-w-3xl mx-auto before:absolute before:top-0 before:bottom-0 before:left-5 before:w-1 before:bg-gray-700">
        {roadmapData.map((item, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 1.0, delay: index * 0.4 },
              },
            }}
            initial="hidden"
            animate={controls}
            className="relative pl-14 mb-12"
          >
            <span
              className={`absolute left-0 top-1 w-10 h-10 flex items-center justify-center rounded-full text-white ${item.color} shadow-md`}
            >
              {item.icon}
            </span>
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-400">
              {item.place} — {item.date}
            </p>
            <p className="mt-2 text-gray-300">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
