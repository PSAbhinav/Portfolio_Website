'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';

const AIStudioIcon = ({ size, className }: any) => <Image src="/ai-studio.svg" width={size} height={size} className={`${className} object-contain`} style={{ width: size, height: size }} alt="AI Studio" />;
const AntigravityIcon = ({ size, className }: any) => <Image src="/antigravity.png" width={size} height={size} className={`${className} object-contain`} style={{ width: size, height: size }} alt="Antigravity" />;
import {
  FaPython,
  FaReact,
  FaHtml5,
  FaBrain
} from 'react-icons/fa';
import {
  SiTailwindcss,
  SiTypescript,
  SiFirebase,
  SiGoogle
} from 'react-icons/si';
import { CgCPlusPlus } from 'react-icons/cg';
import { useAnimationTheme } from './ThemeContext';

const skills = [
  { name: 'Python', icon: FaPython, color: 'from-yellow-400 to-yellow-600', iconColor: 'text-yellow-300', proficiency: 90 },
  { name: 'C', icon: CgCPlusPlus, color: 'from-blue-400 to-blue-600', iconColor: 'text-blue-300', proficiency: 85 },
  { name: 'HTML', icon: FaHtml5, color: 'from-orange-400 to-orange-600', iconColor: 'text-orange-500', proficiency: 95 },
  { name: 'Tailwind CSS', icon: SiTailwindcss, color: 'from-sky-400 to-cyan-600', iconColor: 'text-sky-400', proficiency: 88 },
  { name: 'React', icon: FaReact, color: 'from-cyan-400 to-blue-500', iconColor: 'text-cyan-400', proficiency: 82 },
  { name: 'TypeScript', icon: SiTypescript, color: 'from-blue-400 to-indigo-600', iconColor: 'text-blue-400', proficiency: 75 },
  { name: 'Firebase', icon: SiFirebase, color: 'from-orange-400 to-yellow-500', iconColor: 'text-orange-500', proficiency: 85 },
  { name: 'Antigravity', icon: AntigravityIcon, color: 'from-purple-400 to-pink-500', iconColor: 'text-purple-400', proficiency: 95 },
  { name: 'AI Studio', icon: AIStudioIcon, color: 'from-blue-500 to-cyan-400', iconColor: 'text-blue-400', proficiency: 90 }
];

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-20% 0px', amount: 0.2 });
  const controls = useAnimation();
  const { currentTheme } = useAnimationTheme();

  // Theme-based animation values
  const springConfig = {
    stiffness: currentTheme.animation.springStiffness,
    damping: currentTheme.animation.springDamping,
  };

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [isInView, controls]);

  return (
    <section
      id="skills"
      ref={ref}
      className="min-h-screen py-24 px-6 text-white relative overflow-hidden z-10"
    >

      <motion.h2
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, type: "spring", stiffness: 100 }
          }
        }}
        initial="hidden"
        animate={controls}
        className="text-4xl md:text-5xl font-bold text-center mb-16 relative z-10"
      >
        My <span className="gradient-text">Skills</span>
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
        {skills.map((skill, index) => {
          const IconComponent = skill.icon;
          return (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 50, rotateX: -15 },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: {
                    duration: currentTheme.animation.duration.normal,
                    delay: index * 0.1,
                    type: "spring",
                    ...springConfig
                  }
                }
              }}
              initial="hidden"
              animate={controls}
              whileHover={{ scale: 1.05 }}
              transition={{
                type: "spring",
                ...springConfig
              }}
              className="group relative"
            >
              {/* Card with gradient border on hover */}
              <div className="relative bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-8 border border-white/10 overflow-hidden card-3d">
                {/* Animated gradient border */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  style={{
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    borderRadius: '1rem'
                  }}
                />

                {/* Icon with glow */}
                <div className="flex flex-col items-center relative z-10">
                  <motion.div
                    className="relative mb-4"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Glow effect behind icon */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${skill.color} rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
                      style={{ transform: 'scale(1.5)' }}
                    />
                    <IconComponent size={50} className={`${skill.iconColor} relative z-10`} />
                  </motion.div>

                  <span className="text-lg font-semibold mb-4">{skill.name}</span>

                  {/* Proficiency Bar */}
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.proficiency}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      viewport={{ once: false }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
