'use client'

import { motion } from 'framer-motion'
import { useAnimationTheme } from './ThemeContext'
import { useMemo, useState, useEffect } from 'react'

export default function ProfessionalBackground() {
    const { currentTheme, themeName } = useAnimationTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Get colors from current theme
    const primary = currentTheme.colors.primary
    const secondary = currentTheme.colors.secondary
    const accent = currentTheme.colors.accent
    const glowIntensity = currentTheme.effects.glowIntensity

    // Convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    // Fixed particle positions (no Math.random to avoid hydration issues)
    const particlePositions = useMemo(() => [
        { left: '10%', top: '15%' },
        { left: '25%', top: '45%' },
        { left: '40%', top: '75%' },
        { left: '55%', top: '25%' },
        { left: '70%', top: '55%' },
        { left: '85%', top: '85%' },
        { left: '15%', top: '65%' },
        { left: '35%', top: '35%' },
        { left: '60%', top: '80%' },
        { left: '80%', top: '20%' },
        { left: '5%', top: '90%' },
        { left: '95%', top: '50%' },
    ], [])

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Deep dark gradient base */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-black to-gray-950" />

            {/* Dynamic mesh gradient overlay - MORE VISIBLE */}
            <motion.div
                key={`mesh-${themeName}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                style={{
                    background: `
                        radial-gradient(ellipse 100% 60% at 20% 30%, ${hexToRgba(primary, 0.25 * glowIntensity)} 0%, transparent 60%),
                        radial-gradient(ellipse 80% 50% at 80% 70%, ${hexToRgba(secondary, 0.2 * glowIntensity)} 0%, transparent 60%),
                        radial-gradient(ellipse 60% 40% at 50% 90%, ${hexToRgba(accent, 0.15 * glowIntensity)} 0%, transparent 50%)
                    `
                }}
            />

            {/* Animated gradient orb - LARGER AND MORE VISIBLE */}
            <motion.div
                key={`orb1-${themeName}`}
                className="absolute w-[800px] h-[800px] rounded-full"
                style={{
                    background: `radial-gradient(circle, ${hexToRgba(primary, 0.3 * glowIntensity)} 0%, transparent 60%)`,
                    left: '5%',
                    top: '10%',
                }}
                animate={{
                    x: [0, 80, 0],
                    y: [0, 40, 0],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                key={`orb2-${themeName}`}
                className="absolute w-[700px] h-[700px] rounded-full"
                style={{
                    background: `radial-gradient(circle, ${hexToRgba(secondary, 0.25 * glowIntensity)} 0%, transparent 60%)`,
                    right: '5%',
                    bottom: '10%',
                }}
                animate={{
                    x: [0, -60, 0],
                    y: [0, -40, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Subtle noise texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Elegant horizontal lines - MORE VISIBLE */}
            <div className="absolute inset-0">
                <motion.div
                    key={`line1-${themeName}`}
                    className="absolute top-[20%] left-0 w-full h-[2px]"
                    style={{ background: `linear-gradient(to right, transparent 10%, ${hexToRgba(primary, 0.5)}, transparent 90%)` }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    key={`line2-${themeName}`}
                    className="absolute top-[50%] left-0 w-full h-[2px]"
                    style={{ background: `linear-gradient(to right, transparent 10%, ${hexToRgba(secondary, 0.4)}, transparent 90%)` }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
                <motion.div
                    key={`line3-${themeName}`}
                    className="absolute top-[80%] left-0 w-full h-[2px]"
                    style={{ background: `linear-gradient(to right, transparent 10%, ${hexToRgba(accent, 0.35)}, transparent 90%)` }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                />
            </div>

            {/* Corner accents - LARGER AND MORE VISIBLE */}
            <motion.div
                key={`corner1-${themeName}`}
                className="absolute top-0 left-0 w-96 h-96"
                style={{ background: `linear-gradient(135deg, ${hexToRgba(primary, 0.15)}, transparent 70%)` }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                key={`corner2-${themeName}`}
                className="absolute bottom-0 right-0 w-96 h-96"
                style={{ background: `linear-gradient(315deg, ${hexToRgba(secondary, 0.15)}, transparent 70%)` }}
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
            />

            {/* Floating particles - FIXED POSITIONS (no hydration issues) - Only render after mount */}
            {mounted && particlePositions.slice(0, Math.min(currentTheme.effects.particleCount, 12)).map((pos, i) => (
                <motion.div
                    key={`particle-${themeName}-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                        background: i % 3 === 0 ? primary : i % 3 === 1 ? secondary : accent,
                        left: pos.left,
                        top: pos.top,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                        duration: 4 + (i * 0.5),
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Vignette effect */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)'
                }}
            />

            {/* Theme indicator - MORE VISIBLE */}
            <motion.div
                key={`indicator-${themeName}`}
                className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide"
                style={{
                    background: hexToRgba(primary, 0.3),
                    color: primary,
                    border: `2px solid ${hexToRgba(primary, 0.5)}`,
                    boxShadow: `0 0 20px ${hexToRgba(primary, 0.3)}`
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                ✨ {currentTheme.name}
            </motion.div>
        </div>
    )
}
