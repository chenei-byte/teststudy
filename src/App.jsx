import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStudyData } from './context/StudyDataContext.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { ThemeToggle } from './components/ThemeToggle.jsx'
import { Dashboard } from './tabs/Dashboard.jsx'
import { Tasks } from './tabs/Tasks.jsx'
import { Timer } from './tabs/Timer.jsx'
import { Flashcards } from './tabs/Flashcards.jsx'
import { Whiteboard } from './tabs/Whiteboard.jsx'
import { AiAssistant } from './tabs/AiAssistant.jsx'
import { Progress } from './tabs/Progress.jsx'

const tabTitles = {
  dashboard: 'Dashboard',
  tasks: 'Kanban',
  timer: 'Pomodoro',
  flashcards: 'Flashcards',
  whiteboard: 'Whiteboard',
  ai: 'AI Study Assistant',
  progress: 'Progress',
}

export default function App() {
  const { theme, toggleTheme } = useStudyData()
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50/40 to-amber-50/30 p-4 md:p-6 dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-900">
      <div className="mx-auto flex max-w-[1400px] gap-4 md:gap-6">
        <Sidebar active={activeTab} onSelect={setActiveTab} />
        <main className="relative min-h-[calc(100vh-3rem)] flex-1 overflow-hidden rounded-[2rem] bg-[var(--bg-card)]/95 p-6 shadow-soft ring-1 ring-indigo-100/60 dark:ring-slate-700/60 md:p-8">
          <header className="mb-6 flex items-center justify-between gap-4">
            <motion.h1
              key={activeTab}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl"
            >
              {tabTitles[activeTab]}
            </motion.h1>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </header>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'tasks' && <Tasks />}
              {activeTab === 'timer' && <Timer />}
              {activeTab === 'flashcards' && <Flashcards />}
              {activeTab === 'whiteboard' && <Whiteboard />}
              {activeTab === 'ai' && <AiAssistant />}
              {activeTab === 'progress' && <Progress />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
