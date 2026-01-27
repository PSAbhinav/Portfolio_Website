'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Animation theme configurations
export const animationThemes = {
    tech: {
        name: 'Tech',
        colors: {
            primary: '#3b82f6',    // Blue
            secondary: '#06b6d4',   // Cyan
            accent: '#22d3ee',      // Light Cyan
        },
        background: {
            gradient1: 'rgba(59, 130, 246, 0.15)',
            gradient2: 'rgba(6, 182, 212, 0.12)',
        },
        animation: {
            duration: { fast: 0.3, normal: 0.6, slow: 1.2 },
            easing: 'easeOut',
            springStiffness: 100,
            springDamping: 20,
        },
        effects: {
            glowIntensity: 0.6,
            borderStyle: 'scanning',
            particleCount: 20,
        }
    },
    elegant: {
        name: 'Elegant',
        colors: {
            primary: '#8b5cf6',    // Purple
            secondary: '#ec4899',   // Pink
            accent: '#f472b6',      // Light Pink
        },
        background: {
            gradient1: 'rgba(139, 92, 246, 0.15)',
            gradient2: 'rgba(236, 72, 153, 0.12)',
        },
        animation: {
            duration: { fast: 0.4, normal: 0.8, slow: 1.5 },
            easing: 'easeInOut',
            springStiffness: 80,
            springDamping: 25,
        },
        effects: {
            glowIntensity: 0.5,
            borderStyle: 'flowing',
            particleCount: 15,
        }
    },
    neon: {
        name: 'Neon',
        colors: {
            primary: '#f43f5e',    // Rose
            secondary: '#fbbf24',   // Amber
            accent: '#a3e635',      // Lime
        },
        background: {
            gradient1: 'rgba(244, 63, 94, 0.15)',
            gradient2: 'rgba(251, 191, 36, 0.12)',
        },
        animation: {
            duration: { fast: 0.2, normal: 0.4, slow: 0.8 },
            easing: 'anticipate',
            springStiffness: 150,
            springDamping: 15,
        },
        effects: {
            glowIntensity: 0.8,
            borderStyle: 'pulsing',
            particleCount: 30,
        }
    },
    minimal: {
        name: 'Minimal',
        colors: {
            primary: '#6b7280',    // Gray
            secondary: '#9ca3af',   // Light Gray
            accent: '#d1d5db',      // Lighter Gray
        },
        background: {
            gradient1: 'rgba(107, 114, 128, 0.08)',
            gradient2: 'rgba(156, 163, 175, 0.06)',
        },
        animation: {
            duration: { fast: 0.5, normal: 1.0, slow: 2.0 },
            easing: 'linear',
            springStiffness: 60,
            springDamping: 30,
        },
        effects: {
            glowIntensity: 0.2,
            borderStyle: 'subtle',
            particleCount: 8,
        }
    },
    aurora: {
        name: 'Aurora',
        colors: {
            primary: '#10b981',    // Emerald
            secondary: '#8b5cf6',   // Purple
            accent: '#06b6d4',      // Cyan
        },
        background: {
            gradient1: 'rgba(16, 185, 129, 0.15)',
            gradient2: 'rgba(139, 92, 246, 0.12)',
        },
        animation: {
            duration: { fast: 0.4, normal: 0.7, slow: 1.4 },
            easing: 'easeInOut',
            springStiffness: 90,
            springDamping: 22,
        },
        effects: {
            glowIntensity: 0.7,
            borderStyle: 'wave',
            particleCount: 25,
        }
    }
}

export type ThemeName = keyof typeof animationThemes
export type AnimationTheme = typeof animationThemes[ThemeName]

interface ThemeContextType {
    currentTheme: AnimationTheme
    themeName: ThemeName
    switchTheme: (theme: ThemeName) => void
    randomizeTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Get random theme that's different from current
const getRandomTheme = (currentTheme?: ThemeName): ThemeName => {
    const themeNames = Object.keys(animationThemes) as ThemeName[]
    let newTheme: ThemeName
    do {
        newTheme = themeNames[Math.floor(Math.random() * themeNames.length)]
    } while (newTheme === currentTheme && themeNames.length > 1)
    return newTheme
}

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [themeName, setThemeName] = useState<ThemeName>('tech')
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        // Set random theme on initial load
        const initialTheme = getRandomTheme()
        setThemeName(initialTheme)

        // Change theme randomly every 30-60 minutes
        const scheduleNextChange = () => {
            const minDelay = 30 * 60 * 1000  // 30 minutes
            const maxDelay = 60 * 60 * 1000  // 60 minutes
            const delay = minDelay + Math.random() * (maxDelay - minDelay)

            return setTimeout(() => {
                setThemeName(prev => getRandomTheme(prev))
                scheduleNextChange()
            }, delay)
        }

        const timeoutId = scheduleNextChange()
        return () => clearTimeout(timeoutId)
    }, [])

    const switchTheme = (theme: ThemeName) => {
        setThemeName(theme)
    }

    const randomizeTheme = () => {
        setThemeName(prev => getRandomTheme(prev))
    }

    const value: ThemeContextType = {
        currentTheme: animationThemes[themeName],
        themeName,
        switchTheme,
        randomizeTheme,
    }

    // Prevent hydration mismatch
    if (!isClient) {
        return (
            <ThemeContext.Provider value={{
                currentTheme: animationThemes.tech,
                themeName: 'tech',
                switchTheme: () => { },
                randomizeTheme: () => { },
            }}>
                {children}
            </ThemeContext.Provider>
        )
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useAnimationTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useAnimationTheme must be used within a ThemeProvider')
    }
    return context
}

// Hook to get CSS variables for current theme
export function useThemeStyles() {
    const { currentTheme } = useAnimationTheme()

    return {
        '--theme-primary': currentTheme.colors.primary,
        '--theme-secondary': currentTheme.colors.secondary,
        '--theme-accent': currentTheme.colors.accent,
        '--theme-glow': currentTheme.effects.glowIntensity,
    } as React.CSSProperties
}
