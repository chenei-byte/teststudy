import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStudyData } from '../context/StudyDataContext.jsx'
import { randomQuote } from '../lib/quotes.js'
import { subjectMeta } from '../lib/subjects.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Dashboard() {
  const {
    tasks,
    streak,
    totalHoursThisWeek,
    tasksCompletedThisWeek,
    moveTaskWithMeta,
  } = useStudyData()
  const [quote] = useState(() => randomQuote())

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    []
  )

  const todayKey = new Date().toISOString().slice(0, 10)
  const todayTasks = tasks.filter(
    (t) =>
      (t.column === 'todo' || t.column === 'progress') &&
      (!t.dueDate || t.dueDate === todayKey)
  )

  const toggleTask = (task) => {
    const next = task.column === 'todo' ? 'progress' : 'todo'
    moveTaskWithMeta(task.id, next, task.column)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <motion.section
        layout
        className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-6 text-white shadow-xl"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm font-semibold text-white/90">{dateLabel}</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
          {greeting()}! 👋
        </h2>
        <motion.p
          className="mt-4 max-w-xl rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium leading-relaxed backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          “{quote}”
        </motion.p>
      </motion.section>

      <motion.div
        className="flex flex-col gap-4 rounded-3xl bg-amber-100/80 p-5 shadow-card ring-1 ring-amber-200/60 dark:bg-amber-950/40 dark:ring-amber-800/40"
        whileHover={{ scale: 1.01 }}
      >
        <div className="text-sm font-bold uppercase tracking-wide text-amber-800/80 dark:text-amber-200/90">
          Streak
        </div>
        <div className="text-4xl font-black text-amber-900 dark:text-amber-100">
          {streak} <span className="text-3xl">🔥</span>
        </div>
        <p className="text-sm font-semibold text-amber-900/70 dark:text-amber-200/80">
          Consecutive days with study time logged
        </p>
      </motion.div>

      <motion.section
        className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-slate-700"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
          Today&apos;s focus
        </h3>
        <ul className="mt-4 space-y-2">
          {todayTasks.length === 0 && (
            <li className="rounded-2xl bg-slate-50 px-3 py-4 text-center text-sm font-semibold text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              No tasks due today — add some in Tasks!
            </li>
          )}
          {todayTasks.map((t) => {
            const sm = subjectMeta(t.subject)
            return (
              <motion.li
                key={t.id}
                layout
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/50"
              >
                <input
                  type="checkbox"
                  checked={t.column === 'progress'}
                  onChange={() => toggleTask(t)}
                  className="h-4 w-4 rounded border-indigo-300 text-indigo-600"
                />
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${sm.className}`}
                  style={{
                    background: 'var(--subj-bg)',
                    color: 'var(--subj)',
                  }}
                >
                  {sm.emoji} {sm.label}
                </span>
                <span className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.title}
                </span>
              </motion.li>
            )
          })}
        </ul>
      </motion.section>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        <motion.div
          className="rounded-3xl bg-cyan-50 p-5 shadow-card ring-1 ring-cyan-100 dark:bg-cyan-950/30 dark:ring-cyan-900/40"
          whileHover={{ y: -2 }}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
            This week
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-900 dark:text-cyan-100">
            {totalHoursThisWeek}h
          </p>
          <p className="mt-1 text-sm font-semibold text-cyan-800/80 dark:text-cyan-200/80">
            Total study hours logged
          </p>
        </motion.div>
        <motion.div
          className="rounded-3xl bg-emerald-50 p-5 shadow-card ring-1 ring-emerald-100 dark:bg-emerald-950/30 dark:ring-emerald-900/40"
          whileHover={{ y: -2 }}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Tasks done (7d)
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-900 dark:text-emerald-100">
            {tasksCompletedThisWeek}
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-800/80 dark:text-emerald-200/80">
            Completed tasks this week
          </p>
        </motion.div>
      </div>
    </div>
  )
}
