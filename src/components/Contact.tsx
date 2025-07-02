'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FaPaperPlane } from 'react-icons/fa'
import emailjs from '@emailjs/browser'

export default function Contact() {
  const form = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState('')

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.current) return

    // Debug logs (for local dev only)
    console.log("Sending email with:")
    console.log("Service ID:", process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID)
    console.log("Template ID:", process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID)
    console.log("Public Key:", process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)

    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        form.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      .then(
        () => {
          setStatus('✅ Message sent successfully!')
          form.current?.reset()
        },
        (error) => {
          console.error('EmailJS Error:', error)
          setStatus('❌ Failed to send message. Please check your config and try again.')
        }
      )
  }

  return (
    <section
      id="contact"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-black px-6 py-20 relative overflow-hidden"
    >
      {/* Background Rings */}
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[150px] animate-pulse -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full max-w-6xl mx-auto bg-white/5 backdrop-blur-lg rounded-xl shadow-xl border border-white/10 p-10 lg:flex"
      >
        {/* Left Panel */}
        <div className="flex-1 mb-10 lg:mb-0 lg:pr-10">
          <motion.h2
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Let's build <br />
            something <span className="text-blue-400">awesome</span>
          </motion.h2>
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-gray-300 text-lg"
          >
            Whether you have an idea, a question, or just want to say hello —
            my inbox is always open.
          </motion.p>
        </div>

        {/* Right Panel - Form */}
        <motion.form
          ref={form}
          onSubmit={sendEmail}
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          className="flex-1 space-y-6"
        >
          <div>
            <label className="text-gray-300 block mb-1">Name</label>
            <input
              type="text"
              name="user_name"
              placeholder="John Doe"
              className="w-full bg-white/10 px-4 py-2 text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>
          <div>
            <label className="text-gray-300 block mb-1">Email</label>
            <input
              type="email"
              name="user_email"
              placeholder="example@gmail.com"
              className="w-full bg-white/10 px-4 py-2 text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>
          <div>
            <label className="text-gray-300 block mb-1">Message</label>
            <textarea
              rows={4}
              name="message"
              placeholder="Your message here with email included..."
              className="w-full bg-white/10 px-4 py-2 text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 px-6 py-2 rounded-md transition"
          >
            <FaPaperPlane />
            Send Message
          </button>
          {status && <p className="text-sm text-center text-gray-300">{status}</p>}
        </motion.form>
      </motion.div>
    </section>
  )
}
