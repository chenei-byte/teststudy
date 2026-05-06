import { motion } from 'framer-motion'

export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-card ring-1 ring-indigo-100 transition dark:bg-slate-800/90 dark:ring-indigo-900/40"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.span
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -45, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        className="text-xl"
      >
        {isDark ? '🌙' : '☀️'}
      </motion.span>
    </motion.button>
  )
}
