'use client'

import { motion } from 'framer-motion'
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa'
import { useState } from 'react'

const projects = [
  {
    title: 'AI Chess Bot',
    description: 'Play Smarter: A bot that plays chess using an AI engine trained to improve with every move. Built for fun, challenge, and learning.',
    image: '/projects/ai-chess-bot.png',
    github: 'https://github.com/yourusername/recipe-recommendation',
    demo: 'https://your-recipe-app.netlify.app',
    tags: ['Python', 'AI', 'Machine Learning'],
    color: 'from-purple-500 to-blue-500',
  },
  {
    title: 'Audio-to-Text Converter',
    description: 'Convert Speech to Insights: A lightweight app that turns your audio notes into accurate, editable text using speech recognition.',
    image: '/projects/audio-to-text-converter.png',
    github: 'https://github.com/yourusername/portfolio',
    demo: 'https://your-portfolio.netlify.app',
    tags: ['Python', 'Speech Recognition', 'NLP'],
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Basic Firewall',
    description: 'Network Defense Simplified: A beginner-friendly but functional firewall that detects suspicious activity using basic filtering rules.',
    image: '/projects/basic-firewall.png',
    github: 'https://github.com/yourusername/chat-app',
    demo: 'https://your-chat-app.netlify.app',
    tags: ['Python', 'Networking', 'Security'],
    color: 'from-red-500 to-orange-500',
  },
  {
    title: 'AcadMaster – CGPA/SGPA Calculator',
    description: 'Your Academic Companion: Automates GPA calculations, supports multiple grading systems, and stores historical results.',
    image: '/projects/acadmaster-cgpa-sgpa.png',
    github: 'https://github.com/yourusername/chat-app',
    demo: 'https://your-chat-app.netlify.app',
    tags: ['React', 'JavaScript', 'Education'],
    color: 'from-green-500 to-teal-500',
  },
  {
    title: 'AI Recipe Recommender',
    description: 'Cook with AI: Input your ingredients and let the AI suggest recipes. Includes voice assistant, cooking timer, and smart UX.',
    image: '/projects/ai-recipe-recommender.png',
    github: 'https://github.com/yourusername/chat-app',
    demo: 'https://your-chat-app.netlify.app',
    tags: ['React', 'AI', 'Voice Assistant'],
    color: 'from-pink-500 to-purple-500',
  }
]

export default function Projects() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section
      id="projects"
      className="py-24 px-6 text-white relative overflow-hidden z-10"
    >

      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
        viewport={{ once: false, amount: 0.2 }}
        className="text-4xl md:text-5xl font-bold text-center mb-20 relative z-10"
      >
        My <span className="gradient-text">Projects</span>
      </motion.h2>

      <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto relative z-10">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50, rotateX: -10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.15,
              type: "spring",
              stiffness: 100
            }}
            viewport={{ once: false, amount: 0.2 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="group relative"
          >
            {/* Card */}
            <motion.div
              whileHover={{
                y: -10,
                rotateY: hoveredIndex === index ? 3 : 0,
                rotateX: hoveredIndex === index ? -3 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10"
              style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
            >
              {/* Animated gradient border on hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${project.color} opacity-0 group-hover:opacity-100 transition-all duration-500`}
                style={{
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  borderRadius: '1rem'
                }}
              />

              {/* Image with overlay */}
              <div className="relative h-52 overflow-hidden">
                <motion.img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-contain bg-black/50 transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay on image */}
                <div className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Tags floating on image */}
                <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
                  {project.tags.map((tag, tagIndex) => (
                    <motion.span
                      key={tagIndex}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + tagIndex * 0.1 }}
                      className="px-2 py-1 text-xs font-medium bg-black/60 backdrop-blur-sm rounded-full border border-white/20"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 relative">
                <motion.h3
                  className="text-2xl font-bold mb-2 group-hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  {project.title}
                </motion.h3>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">{project.description}</p>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <motion.a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${project.color} rounded-full text-sm font-semibold btn-glow`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaGithub /> GitHub
                  </motion.a>
                  <motion.a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border border-white/30 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaExternalLinkAlt /> Demo
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
