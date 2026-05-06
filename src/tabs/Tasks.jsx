import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudyData } from '../context/StudyDataContext.jsx'
import { subjectMeta, SUBJECT_OPTIONS } from '../lib/subjects.js'

const COLS = [
  { id: 'todo', title: 'To Do', emoji: '📋', tint: 'from-sky-50 to-indigo-50' },
  {
    id: 'progress',
    title: 'In Progress',
    emoji: '⚡',
    tint: 'from-amber-50 to-orange-50',
  },
  { id: 'done', title: 'Done', emoji: '🎉', tint: 'from-emerald-50 to-teal-50' },
]

const COL_ORDER = ['todo', 'progress', 'done']

const PRIORITY_STYLES = {
  high: 'bg-rose-500 text-white',
  medium: 'bg-amber-400 text-amber-950',
  low: 'bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100',
}

function TaskCardDisplay({ task, dragProps, style, isOverlay }) {
  const sm = subjectMeta(task.subject)
  return (
    <motion.div
      ref={dragProps?.ref}
      style={style}
      layout
      {...dragProps?.attributes}
      {...dragProps?.listeners}
      whileHover={{ scale: isOverlay ? 1 : 1.02 }}
      className={`rounded-2xl border border-slate-100 bg-white p-3 shadow-card ring-1 ring-slate-100/80 dark:border-slate-700 dark:bg-slate-800 dark:ring-slate-700 ${
        dragProps ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isOverlay ? 'rotate-2 shadow-2xl ring-2 ring-indigo-300' : ''} ${
        dragProps?.isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${sm.className}`}
          style={{ background: 'var(--subj-bg)', color: 'var(--subj)' }}
        >
          {sm.emoji} {sm.label}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}
        >
          {task.priority}
        </span>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">
        {task.title}
      </p>
    </motion.div>
  )
}

function SortableTaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <TaskCardDisplay
      task={task}
      dragProps={{
        ref: setNodeRef,
        attributes,
        listeners,
        isDragging,
      }}
      style={style}
    />
  )
}

function Column({ col, items, children }) {
  const { setNodeRef } = useDroppable({ id: col.id })
  return (
    <div
      className={`flex min-h-[420px] flex-1 flex-col rounded-3xl bg-gradient-to-b p-4 shadow-inner ring-1 ring-slate-100/80 dark:ring-slate-700/80 ${col.tint} dark:from-slate-900 dark:to-slate-900/80`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
          <span className="mr-1">{col.emoji}</span>
          {col.title}
        </h3>
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {items.length}
        </span>
      </div>
      <SortableContext
        items={items.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex flex-1 flex-col gap-2">
          {children}
        </div>
      </SortableContext>
    </div>
  )
}

export function Tasks() {
  const {
    tasks,
    setTasks,
    addTask,
    reorderTasksInColumn,
    incrementTasksCompleted,
  } = useStudyData()
  const [modalOpen, setModalOpen] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    subject: 'general',
    priority: 'medium',
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const byColumn = useMemo(() => {
    const map = { todo: [], progress: [], done: [] }
    for (const t of tasks) {
      if (map[t.column]) map[t.column].push(t)
    }
    return map
  }, [tasks])

  const findContainer = (id) => {
    if (COL_ORDER.includes(id)) return id
    return tasks.find((t) => t.id === id)?.column
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const activeContainer = findContainer(active.id)
    const overContainer = findContainer(over.id)
    if (!activeContainer || !overContainer) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    if (activeContainer === overContainer) {
      const list = byColumn[activeContainer]
      const oldIndex = list.findIndex((t) => t.id === active.id)
      const newIndex = list.findIndex((t) => t.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const ordered = arrayMove(
          list.map((t) => t.id),
          oldIndex,
          newIndex
        )
        reorderTasksInColumn(activeContainer, ordered)
      }
      return
    }

    const prevCol = activeTask.column
    const nextMap = {
      todo: byColumn.todo.map((t) => t.id),
      progress: byColumn.progress.map((t) => t.id),
      done: byColumn.done.map((t) => t.id),
    }
    nextMap[activeContainer] = nextMap[activeContainer].filter(
      (id) => id !== active.id
    )
    const destIds = [...nextMap[overContainer]]
    let insertAt = destIds.length
    if (over.id !== overContainer) {
      const i = destIds.indexOf(over.id)
      if (i >= 0) insertAt = i
    }
    nextMap[overContainer] = [
      ...destIds.slice(0, insertAt),
      active.id,
      ...destIds.slice(insertAt),
    ]

    const flat = []
    for (const col of COL_ORDER) {
      for (const id of nextMap[col]) {
        const orig = tasks.find((t) => t.id === id)
        if (!orig) continue
        const row = { ...orig, column: col }
        if (col === 'done' && orig.column !== 'done') {
          row.completedAt = new Date().toISOString()
        } else if (col === 'done' && orig.completedAt) {
          row.completedAt = orig.completedAt
        } else {
          delete row.completedAt
        }
        flat.push(row)
      }
    }

    setTasks(flat)
    if (overContainer === 'done' && prevCol !== 'done') {
      incrementTasksCompleted()
    }
  }

  const submitTask = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    addTask({
      title: form.title.trim(),
      subject: form.subject,
      priority: form.priority,
      dueDate: new Date().toISOString().slice(0, 10),
    })
    setForm({ title: '', subject: 'general', priority: 'medium' })
    setModalOpen(false)
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setModalOpen(true)}
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-300/40"
        >
          + New task
        </motion.button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex flex-col gap-4 lg:flex-row">
          {COLS.map((col) => (
            <Column key={col.id} col={col} items={byColumn[col.id]}>
              {byColumn[col.id].map((t) => (
                <SortableTaskCard key={t.id} task={t} />
              ))}
            </Column>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCardDisplay task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onSubmit={submitTask}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-indigo-100 dark:bg-slate-900 dark:ring-slate-700"
            >
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                New task
              </h3>
              <label className="mt-4 block text-xs font-bold uppercase text-slate-500">
                Title
                <input
                  autoFocus
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none ring-indigo-200 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="What will you tackle?"
                />
              </label>
              <label className="mt-3 block text-xs font-bold uppercase text-slate-500">
                Subject
                <select
                  value={form.subject}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.emoji} {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3 block text-xs font-bold uppercase text-slate-500">
                Priority
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value }))
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-extrabold text-white shadow-md hover:bg-indigo-500"
                >
                  Add
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
