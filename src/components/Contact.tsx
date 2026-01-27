'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaperPlane, FaCheckCircle, FaExclamationCircle, FaEnvelope, FaUser, FaComment, FaPhone } from 'react-icons/fa'
import emailjs from '@emailjs/browser'

export default function Contact() {
  const form = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'not-configured'>('idle')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const isConfigured =
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID &&
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.current) return

    if (!isConfigured) {
      setStatus('not-configured')
      return
    }

    setStatus('sending')

    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        form.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      setStatus('success')
      form.current?.reset()
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error: unknown) {
      // Better error logging for EmailJS
      if (error instanceof Error) {
        console.error('EmailJS Error:', error.message)
      } else if (typeof error === 'object' && error !== null) {
        const emailError = error as { text?: string; status?: number }
        console.error('EmailJS Error:', emailError.text || emailError.status || JSON.stringify(error))
      } else {
        console.error('EmailJS Error:', error)
      }
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <section
      id="contact"
      className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden z-10"
    >

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        viewport={{ once: false }}
        className="w-full max-w-6xl mx-auto glass rounded-3xl shadow-2xl border border-white/10 p-10 lg:flex relative z-10"
      >
        {/* Left Panel */}
        <div className="flex-1 mb-10 lg:mb-0 lg:pr-10">
          <motion.h2
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            viewport={{ once: false }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Let's build <br />
            something <span className="gradient-text">awesome</span>
          </motion.h2>
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: false }}
            className="text-gray-300 text-lg leading-relaxed"
          >
            Whether you have an idea, a question, or just want to say hello —
            my inbox is always open. Let's create something amazing together!
          </motion.p>

          {/* Social reminder */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: false }}
            className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-gray-400 text-sm">
              💡 I'll reach out to you via email or phone as soon as possible!
            </p>
          </motion.div>
        </div>

        {/* Right Panel - Form */}
        <motion.form
          ref={form}
          onSubmit={sendEmail}
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
          viewport={{ once: false }}
          className="flex-1 space-y-6"
        >
          {/* Name Field */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <FaUser className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'name' ? 'text-blue-400' : 'text-gray-500'
              }`} />
            <input
              type="text"
              name="user_name"
              placeholder="Your Name"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              className={`w-full bg-white/5 pl-12 pr-4 py-4 text-white rounded-xl border transition-all duration-300 focus:outline-none ${focusedField === 'name'
                ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'border-white/10 hover:border-white/20'
                }`}
              required
            />
          </motion.div>

          {/* Email Field */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <FaEnvelope className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-400' : 'text-gray-500'
              }`} />
            <input
              type="email"
              name="user_email"
              placeholder="your.email@example.com"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className={`w-full bg-white/5 pl-12 pr-4 py-4 text-white rounded-xl border transition-all duration-300 focus:outline-none ${focusedField === 'email'
                ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'border-white/10 hover:border-white/20'
                }`}
              required
            />
          </motion.div>

          {/* Phone Field */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <FaPhone className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'phone' ? 'text-blue-400' : 'text-gray-500'
              }`} />
            <input
              type="tel"
              name="user_phone"
              placeholder="Your Phone Number"
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              className={`w-full bg-white/5 pl-12 pr-4 py-4 text-white rounded-xl border transition-all duration-300 focus:outline-none ${focusedField === 'phone'
                ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'border-white/10 hover:border-white/20'
                }`}
              required
            />
          </motion.div>

          {/* Message Field */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <FaComment className={`absolute left-4 top-4 transition-colors duration-300 ${focusedField === 'message' ? 'text-blue-400' : 'text-gray-500'
              }`} />
            <textarea
              rows={5}
              name="message"
              placeholder="Your message..."
              onFocus={() => setFocusedField('message')}
              onBlur={() => setFocusedField(null)}
              className={`w-full bg-white/5 pl-12 pr-4 py-4 text-white rounded-xl border transition-all duration-300 focus:outline-none resize-none ${focusedField === 'message'
                ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'border-white/10 hover:border-white/20'
                }`}
              required
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={status === 'sending'}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 btn-glow ripple ${status === 'sending'
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
              }`}
            whileHover={{ scale: status === 'sending' ? 1 : 1.02 }}
            whileTap={{ scale: status === 'sending' ? 1 : 0.98 }}
          >
            {status === 'sending' ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane />
                Send Message
              </>
            )}
          </motion.button>

          {/* Status Messages */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400"
              >
                <FaCheckCircle className="text-xl" />
                <span>Message sent successfully! I'll get back to you soon.</span>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400"
              >
                <FaExclamationCircle className="text-xl" />
                <span>Failed to send message. Please try again later.</span>
              </motion.div>
            )}

            {status === 'not-configured' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400"
              >
                <FaExclamationCircle className="text-xl" />
                <span>EmailJS is not configured. Please add credentials to .env.local</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </motion.div>
    </section>
  )
}
