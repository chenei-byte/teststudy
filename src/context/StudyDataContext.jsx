import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { load, save } from '../lib/storage.js'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function weekStartKey(d = new Date()) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = x.getDate() - day + (day === 0 ? -6 : 1)
  x.setDate(diff)
  x.setHours(0, 0, 0, 0)
  return x.toISOString().slice(0, 10)
}

function uid() {
  return crypto.randomUUID?.() || String(Date.now()) + Math.random()
}

const defaultTasks = [
  {
    id: uid(),
    title: 'Skim lecture notes',
    subject: 'science',
    priority: 'medium',
    column: 'todo',
    dueDate: todayKey(),
  },
  {
    id: uid(),
    title: 'Practice problem set',
    subject: 'math',
    priority: 'high',
    column: 'progress',
  },
]

const StudyDataContext = createContext(null)

export function StudyDataProvider({ children }) {
  const [theme, setThemeState] = useState(() => load('theme', 'light'))
  const [tasks, setTasks] = useState(() => load('tasks', defaultTasks))
  const [flashcardDecks, setFlashcardDecks] = useState(() =>
    load('flashcards', [])
  )
  const [pomodoroCompleted, setPomodoroCompleted] = useState(() =>
    load('pomodoroCompleted', 0)
  )
  const [dailyMinutes, setDailyMinutes] = useState(() =>
    load('dailyMinutes', {})
  )
  const [weeklySubjectMinutes, setWeeklySubjectMinutes] = useState(() =>
    load('weeklySubjectMinutes', { weekId: weekStartKey(), bySubject: {} })
  )
  const [tasksCompletedAllTime, setTasksCompletedAllTime] = useState(() =>
    load('tasksCompletedAllTime', 0)
  )
  const [timerSubject, setTimerSubject] = useState(() =>
    load('timerSubject', 'general')
  )

  useEffect(() => {
    save('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => save('tasks', tasks), [tasks])
  useEffect(() => save('flashcards', flashcardDecks), [flashcardDecks])
  useEffect(() => save('pomodoroCompleted', pomodoroCompleted), [
    pomodoroCompleted,
  ])
  useEffect(() => save('dailyMinutes', dailyMinutes), [dailyMinutes])
  useEffect(
    () => save('weeklySubjectMinutes', weeklySubjectMinutes),
    [weeklySubjectMinutes]
  )
  useEffect(
    () => save('tasksCompletedAllTime', tasksCompletedAllTime),
    [tasksCompletedAllTime]
  )
  useEffect(() => save('timerSubject', timerSubject), [timerSubject])

  const setTheme = useCallback((t) => setThemeState(t), [])
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const recordFocusSession = useCallback(
    (subjectId, minutes) => {
      const day = todayKey()
      setDailyMinutes((prev) => ({
        ...prev,
        [day]: (prev[day] || 0) + minutes,
      }))
      setWeeklySubjectMinutes((prev) => {
        const wk = weekStartKey()
        const base =
          prev.weekId === wk ? prev : { weekId: wk, bySubject: {} }
        return {
          ...base,
          bySubject: {
            ...base.bySubject,
            [subjectId]: (base.bySubject[subjectId] || 0) + minutes,
          },
        }
      })
      setPomodoroCompleted((n) => n + 1)
    },
    []
  )

  const addTask = useCallback((task) => {
    setTasks((prev) => [
      ...prev,
      {
        id: uid(),
        column: 'todo',
        ...task,
      },
    ])
  }, [])

  /** Batch move: also handles completion counter inside setTasks */
  const moveTaskWithMeta = useCallback((taskId, column, prevColumn) => {
    if (column === 'done' && prevColumn !== 'done') {
      setTasksCompletedAllTime((c) => c + 1)
    }
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const next = { ...t, column }
        if (column === 'done' && prevColumn !== 'done') {
          next.completedAt = new Date().toISOString()
        }
        if (column !== 'done') delete next.completedAt
        return next
      })
    )
  }, [])

  const reorderTasksInColumn = useCallback((column, orderedIds) => {
    setTasks((prev) => {
      const others = prev.filter((t) => t.column !== column)
      const inCol = prev.filter((t) => t.column === column)
      const map = Object.fromEntries(inCol.map((t) => [t.id, t]))
      const ordered = orderedIds.map((id) => map[id]).filter(Boolean)
      return [...others, ...ordered]
    })
  }, [])

  const deleteTask = useCallback((taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }, [])

  const incrementTasksCompleted = useCallback(() => {
    setTasksCompletedAllTime((c) => c + 1)
  }, [])

  const addDeck = useCallback((subject, name) => {
    const deck = {
      id: uid(),
      subject,
      name: name || 'New deck',
      cards: [],
    }
    setFlashcardDecks((d) => [...d, deck])
    return deck.id
  }, [])

  const addCard = useCallback((deckId, front, back) => {
    const card = { id: uid(), front, back, status: 'learning' }
    setFlashcardDecks((decks) =>
      decks.map((d) =>
        d.id === deckId ? { ...d, cards: [...d.cards, card] } : d
      )
    )
  }, [])

  const updateCardStatus = useCallback((deckId, cardId, status) => {
    setFlashcardDecks((decks) =>
      decks.map((d) => {
        if (d.id !== deckId) return d
        return {
          ...d,
          cards: d.cards.map((c) =>
            c.id === cardId ? { ...c, status } : c
          ),
        }
      })
    )
  }, [])

  const rotateLearningCard = useCallback((deckId, cardId) => {
    setFlashcardDecks((decks) =>
      decks.map((d) => {
        if (d.id !== deckId) return d
        const cards = [...d.cards]
        const idx = cards.findIndex((c) => c.id === cardId)
        if (idx === -1) return d
        const [c] = cards.splice(idx, 1)
        cards.push(c)
        return { ...d, cards }
      })
    )
  }, [])

  const streak = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    let s = 0
    for (let j = 0; j < 400; j++) {
      const k = d.toISOString().slice(0, 10)
      if ((dailyMinutes[k] || 0) > 0) s++
      else break
      d.setDate(d.getDate() - 1)
    }
    return s
  }, [dailyMinutes])

  const totalHoursThisWeek = useMemo(() => {
    let m = 0
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    for (let i = 0; i < 7; i++) {
      const k = start.toISOString().slice(0, 10)
      m += dailyMinutes[k] || 0
      start.setDate(start.getDate() - 1)
    }
    return Math.round((m / 60) * 10) / 10
  }, [dailyMinutes])

  const tasksCompletedThisWeek = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - 7)
    return tasks.filter(
      (t) =>
        t.column === 'done' &&
        t.completedAt &&
        new Date(t.completedAt) >= start
    ).length
  }, [tasks])

  const totalMinutesAllTime = useMemo(
    () => Object.values(dailyMinutes).reduce((a, b) => a + b, 0),
    [dailyMinutes]
  )

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      tasks,
      setTasks,
      addTask,
      moveTaskWithMeta,
      reorderTasksInColumn,
      deleteTask,
      incrementTasksCompleted,
      flashcardDecks,
      addDeck,
      addCard,
      updateCardStatus,
      rotateLearningCard,
      pomodoroCompleted,
      recordFocusSession,
      dailyMinutes,
      weeklySubjectMinutes,
      tasksCompletedAllTime,
      tasksCompletedThisWeek,
      streak,
      totalHoursThisWeek,
      totalHoursAllTime: Math.round((totalMinutesAllTime / 60) * 10) / 10,
      timerSubject,
      setTimerSubject,
    }),
    [
      theme,
      setTheme,
      toggleTheme,
      tasks,
      setTasks,
      addTask,
      moveTaskWithMeta,
      reorderTasksInColumn,
      deleteTask,
      incrementTasksCompleted,
      flashcardDecks,
      addDeck,
      addCard,
      updateCardStatus,
      rotateLearningCard,
      pomodoroCompleted,
      recordFocusSession,
      dailyMinutes,
      weeklySubjectMinutes,
      tasksCompletedAllTime,
      tasksCompletedThisWeek,
      streak,
      totalHoursThisWeek,
      totalMinutesAllTime,
      timerSubject,
    ]
  )

  return (
    <StudyDataContext.Provider value={value}>
      {children}
    </StudyDataContext.Provider>
  )
}

export function useStudyData() {
  const ctx = useContext(StudyDataContext)
  if (!ctx) throw new Error('useStudyData outside provider')
  return ctx
}
