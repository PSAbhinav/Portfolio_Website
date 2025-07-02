'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full px-6 py-4 bg-black bg-opacity-80 backdrop-blur-sm z-50 shadow-md">
      <ul className="flex justify-center space-x-8 text-white text-lg font-medium">
        <li><Link href="/">Home</Link></li>
        <li><Link href="#about">About</Link></li>
        <li><Link href="#skills">Skills</Link></li>
        <li><Link href="#timeline">Timeline</Link></li>
        <li><Link href="#projects">Projects</Link></li>
        <li><Link href="#contact">Contact</Link></li>
      </ul>
    </nav>
  )
}
