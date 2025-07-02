'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  FaPython,
  FaReact,
  FaHtml5
} from 'react-icons/fa';
import {
  SiTailwindcss,
  SiTypescript
} from 'react-icons/si';
import { CgCPlusPlus } from 'react-icons/cg'; // Used for C icon (closest available)

const skills = [
  { name: 'Python', icon: <FaPython size={40} className="text-yellow-300" /> },
  { name: 'C', icon: <CgCPlusPlus size={40} className="text-blue-300" /> },
  { name: 'HTML', icon: <FaHtml5 size={40} className="text-orange-500" /> },
  { name: 'Tailwind CSS', icon: <SiTailwindcss size={40} className="text-sky-400" /> },
  { name: 'React', icon: <FaReact size={40} className="text-cyan-400" /> },
  { name: 'TypeScript', icon: <SiTypescript size={40} className="text-blue-400" /> }
];

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-20% 0px', amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [isInView]);

  return (
    <section
      id="skills"
      ref={ref}
      className="min-h-screen py-24 px-6 bg-black text-white relative overflow-hidden before:absolute before:inset-0 before:z-0 before:bg-gradient-to-r before:from-neutral-900/90 before:via-neutral-950/95 before:to-neutral-900/90 before:animate-horizontalScroll"
    >
      <motion.h2
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
        }}
        initial="hidden"
        animate={controls}
        className="text-4xl font-bold text-center mb-12 relative z-10"
      >
        My Skills
      </motion.h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 max-w-6xl mx-auto z-10">
        {skills.map((skill, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.7, delay: index * 0.2 }
              }
            }}
            initial="hidden"
            animate={controls}
            className="flex flex-col items-center bg-neutral-900 p-6 rounded-lg shadow-md hover:scale-105 transform transition z-10"
          >
            {skill.icon}
            <span className="mt-2 text-sm">{skill.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
