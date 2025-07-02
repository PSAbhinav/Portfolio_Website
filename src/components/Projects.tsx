'use client'

import { motion } from 'framer-motion'
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa'

const projects = [
  {
    title: 'AI Chess Bot',
    description: 'Play Smarter: A bot that plays chess using an AI engine trained to improve with every move. Built for fun, challenge, and learning.',
    image: '/projects/ai-chess-bot.png',
    github: 'https://github.com/yourusername/recipe-recommendation',
    demo: 'https://your-recipe-app.netlify.app',
  },
  {
    title: 'Audio-to-Text Converter',
    description: 'Convert Speech to Insights: A lightweight app that turns your audio notes into accurate, editable text using speech recognition.',
    image: '/projects/audio-to-text-converter.png',
    github: 'https://github.com/yourusername/portfolio',
    demo: 'https://your-portfolio.netlify.app',
  },
  {
    title: 'Basic Firewall',
    description: 'Network Defense Simplified: A beginner-friendly but functional firewall that detects suspicious activity using basic filtering rules.',
    image: '/projects/basic-firewall.png',
    github: 'https://github.com/yourusername/chat-app',
    demo: 'https://your-chat-app.netlify.app',
  },
  {
    title: 'AcadMaster – CGPA/SGPA Calculator',
    description: 'Your Academic Companion: Automates GPA calculations, supports multiple grading systems, and stores historical results.',
    image: '/projects/acadmaster-cgpa-sgpa.png',
    github: 'https://github.com/yourusername/chat-app',
    demo: 'https://your-chat-app.netlify.app',
  },
  {
    title: 'AI Recipe Recommender (Currently Working)',
    description: 'Cook with AI: Input your ingredients and let the AI suggest recipes. Includes voice assistant, cooking timer, and smart UX.',
    image: '/projects/ai-recipe-recommender.png',
    github: 'https://github.com/yourusername/chat-app',
    demo: 'https://your-chat-app.netlify.app',
  }
]

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6 bg-neutral-900 text-white relative overflow-hidden before:absolute before:inset-0 before:z-0 before:bg-gradient-to-b before:from-neutral-900/90 before:via-neutral-950/95 before:to-neutral-900/90 before:animate-verticalScroll">
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: false, amount: 0.2 }}
        className="text-4xl font-bold text-center mb-16 relative z-10"
      >
        My Projects
      </motion.h2>

      <div className="grid gap-10 md:grid-cols-2 max-w-6xl mx-auto">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: index * 0.3 }}
            viewport={{ once: false, amount: 0.2 }}
            className="bg-neutral-800 rounded-lg overflow-hidden shadow-lg z-10"
          >
            <img src={project.image} alt={project.title} className="w-full h-48 object-contain bg-black" />
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">{project.title}</h3>
              <p className="text-gray-300 mb-4">{project.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
