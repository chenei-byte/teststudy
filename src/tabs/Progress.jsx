import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStudyData } from '../context/StudyDataContext.jsx'
import { computeBadges } from '../lib/badges.js'
import { SUBJECT_OPTIONS } from '../lib/subjects.js'

function intensityClass(minutes) {
  if (minutes <= 0) return 'bg-slate-200/80 dark:bg-slate-800'
  if (minutes < 15) return 'bg-emerald-200 dark:bg-emerald-900/60'
  if (minutes < 45) return 'bg-emerald-400 dark:bg-emerald-600/80'
  return 'bg-emerald-600 dark:bg-emerald-400/90'
}

function buildHeatmapCells(dailyMinutes) {
  const cells = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  for (let i = 0; i < 371; i++) {
    const key = d.toISOString().slice(0, 10)
    cells.push({ key, minutes: dailyMinutes[key] || 0 })
    d.setDate(d.getDate() - 1)
  }
  cells.reverse()
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

export function Progress() {
  const {
    dailyMinutes,
    weeklySubjectMinutes,
    streak,
    pomodoroCompleted,
    totalHoursAllTime,
    tasksCompletedAllTime,
  } = useStudyData()

  const weeks = useMemo(() => buildHeatmapCells(dailyMinutes), [dailyMinutes])

  const barData = useMemo(() => {
    const by = weeklySubjectMinutes.bySubject || {}
    return SUBJECT_OPTIONS.map((s) => ({
      name: `${s.emoji}`,
      hours: Math.round(((by[s.id] || 0) / 60) * 10) / 10,
      label: s.label,
    })).filter((d) => d.hours > 0)
  }, [weeklySubjectMinutes])

  const badges = computeBadges({
    totalSessions: pomodoroCompleted,
    streak,
    totalHoursAllTime,
    tasksCompletedAllTime,
  })

  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-3 text-lg font-extrabold text-slate-800 dark:text-slate-100">
          Study heatmap
        </h3>
        <p className="mb-4 text-sm font-semibold text-slate-500">
          Last ~53 weeks · minutes logged per day
        </p>
        <div className="overflow-x-auto rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-slate-700">
          <div className="flex gap-1 pb-1" style={{ minWidth: weeks.length * 12 }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((cell) => (
                  <motion.div
                    key={cell.key}
                    initial={false}
                    whileHover={{ scale: 1.15 }}
                    title={`${cell.key}: ${cell.minutes} min`}
                    className={`h-3 w-3 rounded-sm ${intensityClass(cell.minutes)}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Less</span>
            <span className="h-3 w-3 rounded-sm bg-slate-200 dark:bg-slate-800" />
            <span className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/60" />
            <span className="h-3 w-3 rounded-sm bg-emerald-400 dark:bg-emerald-600/80" />
            <span className="h-3 w-3 rounded-sm bg-emerald-600 dark:bg-emerald-400/90" />
            <span>More</span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-extrabold text-slate-800 dark:text-slate-100">
          Hours by subject (this week)
        </h3>
        <div className="h-72 w-full rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-slate-700">
          {barData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
              Complete a focus session to see subject hours here.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  label={{
                    value: 'Hours',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11 },
                  }}
                />
                <Tooltip
                  formatter={(v) => [`${v} h`, 'Studied']}
                  labelFormatter={(_, p) => p?.[0]?.payload?.label || ''}
                />
                <Bar
                  dataKey="hours"
                  fill="url(#barGrad)"
                  radius={[10, 10, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-extrabold text-slate-800 dark:text-slate-100">
          Badges
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.length === 0 && (
            <p className="col-span-full rounded-3xl bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500 dark:bg-slate-900/50">
              Keep studying to unlock your first badge!
            </p>
          )}
          {badges.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-card ring-1 ring-amber-100 dark:from-amber-950/40 dark:to-orange-950/30 dark:ring-amber-900/40"
            >
              <div className="text-4xl">{b.emoji}</div>
              <h4 className="mt-2 font-extrabold text-slate-900 dark:text-white">
                {b.title}
              </h4>
              <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
