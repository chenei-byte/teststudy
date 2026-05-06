import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStudyData } from '../context/StudyDataContext.jsx'
import { SUBJECT_OPTIONS } from '../lib/subjects.js'

const MODES = {
  focus: { label: 'Focus', minutes: 25, emoji: '🎯' },
  short: { label: 'Short Break', minutes: 5, emoji: '☕' },
  long: { label: 'Long Break', minutes: 15, emoji: '🌴' },
}

const R = 120
const C = 2 * Math.PI * R

export function Timer() {
  const { recordFocusSession, pomodoroCompleted, timerSubject, setTimerSubject } =
    useStudyData()
  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60)
  const [running, setRunning] = useState(false)
  const tickRef = useRef(null)
  const sessionCommittedRef = useRef(false)

  const totalSeconds = MODES[mode].minutes * 60
  const progress = 1 - secondsLeft / totalSeconds

  useEffect(() => {
    if (secondsLeft === totalSeconds) sessionCommittedRef.current = false
  }, [secondsLeft, totalSeconds])

  useEffect(() => {
    if (!running) return
    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(tickRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(tickRef.current)
  }, [running])

  useEffect(() => {
    if (secondsLeft !== 0 || sessionCommittedRef.current) return
    sessionCommittedRef.current = true
    setRunning(false)
    if (mode === 'focus') {
      recordFocusSession(timerSubject, MODES.focus.minutes)
    }
  }, [secondsLeft, mode, recordFocusSession, timerSubject])

  const switchMode = useCallback((m) => {
    setRunning(false)
    setMode(m)
    setSecondsLeft(MODES[m].minutes * 60)
    sessionCommittedRef.current = false
  }, [])

  const reset = useCallback(() => {
    setRunning(false)
    setSecondsLeft(MODES[mode].minutes * 60)
    sessionCommittedRef.current = false
  }, [mode])

  const mmss = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
    const s = secondsLeft % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [secondsLeft])

  const dashOffset = C * (1 - progress)

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-8">
      <div className="flex flex-wrap justify-center gap-2">
        {Object.entries(MODES).map(([key, cfg]) => (
          <motion.button
            key={key}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => switchMode(key)}
            className={`rounded-2xl px-4 py-2 text-sm font-extrabold shadow-md transition ${
              mode === key
                ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600'
            }`}
          >
            {cfg.emoji} {cfg.label}
          </motion.button>
        ))}
      </div>

      {mode === 'focus' && (
        <label className="flex w-full max-w-xs flex-col gap-1 text-xs font-bold uppercase text-slate-500">
          Subject for this session
          <select
            value={timerSubject}
            onChange={(e) => setTimerSubject(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {SUBJECT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="relative flex items-center justify-center">
        <svg width={R * 2 + 40} height={R * 2 + 40} className="-rotate-90">
          <circle
            cx={R + 20}
            cy={R + 20}
            r={R}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="14"
          />
          <motion.circle
            cx={R + 20}
            cy={R + 20}
            r={R}
            fill="none"
            stroke="url(#timerGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={false}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
          </defs>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tabular-nums text-slate-800 dark:text-slate-100 md:text-5xl">
            {mmss}
          </span>
          <span className="mt-1 text-sm font-bold text-slate-500">
            {MODES[mode].emoji} {MODES[mode].label}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (secondsLeft <= 0) {
              setSecondsLeft(MODES[mode].minutes * 60)
              sessionCommittedRef.current = false
            }
            setRunning((r) => !r)
          }}
          className="rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-300/40 dark:shadow-indigo-900/40"
        >
          {running ? 'Pause' : 'Play'}
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="rounded-2xl bg-slate-200 px-6 py-3 text-sm font-extrabold text-slate-800 dark:bg-slate-700 dark:text-slate-100"
        >
          Reset
        </motion.button>
      </div>

      <motion.div
        layout
        className="w-full rounded-3xl bg-rose-50 p-5 text-center shadow-card ring-1 ring-rose-100 dark:bg-rose-950/30 dark:ring-rose-900/40"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-rose-600 dark:text-rose-300">
          Sessions completed
        </p>
        <p className="mt-2 text-2xl font-black text-rose-900 dark:text-rose-100">
          {Array.from({ length: Math.min(pomodoroCompleted, 12) }, () => '🍅').join('')}
          {pomodoroCompleted === 0 && '—'}
          {pomodoroCompleted > 12 && ` +${pomodoroCompleted - 12}`}
        </p>
        <p className="mt-1 text-sm font-semibold text-rose-800/80 dark:text-rose-200/80">
          Total: {pomodoroCompleted} focus session
          {pomodoroCompleted !== 1 ? 's' : ''}
        </p>
      </motion.div>
    </div>
  )
}
