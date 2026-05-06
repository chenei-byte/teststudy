import { motion } from 'framer-motion'

const NAV = [
  { id: 'dashboard', emoji: '🏠', label: 'Dashboard' },
  { id: 'tasks', emoji: '✅', label: 'Tasks' },
  { id: 'timer', emoji: '⏱', label: 'Timer' },
  { id: 'flashcards', emoji: '🃏', label: 'Flashcards' },
  { id: 'whiteboard', emoji: '🖊️', label: 'Whiteboard' },
  { id: 'ai', emoji: '🤖', label: 'AI Assistant' },
  { id: 'progress', emoji: '📊', label: 'Progress' },
]

export function Sidebar({ active, onSelect }) {
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-2 rounded-3xl bg-white/90 p-4 shadow-soft ring-1 ring-indigo-100/80 dark:bg-slate-900/90 dark:ring-indigo-950/50">
      <div className="mb-4 px-2">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-extrabold tracking-tight text-indigo-600 dark:text-indigo-300"
        >
          ✨ Study Hub
        </motion.div>
        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Learn. Play. Repeat.
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const isActive = active === item.id
          return (
            <motion.button
              key={item.id}
              type="button"
              layout
              onClick={() => onSelect(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-300/40 dark:shadow-indigo-900/30'
                  : 'text-slate-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">{item.emoji}</span>
              {item.label}
            </motion.button>
          )
        })}
      </nav>
    </aside>
  )
}
