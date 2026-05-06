import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudyData } from '../context/StudyDataContext.jsx'
import { subjectMeta, SUBJECT_OPTIONS } from '../lib/subjects.js'

export function Flashcards() {
  const {
    flashcardDecks,
    addDeck,
    addCard,
    updateCardStatus,
    rotateLearningCard,
  } = useStudyData()
  const [selectedDeckId, setSelectedDeckId] = useState(null)
  const [flipped, setFlipped] = useState(false)
  const [deckModal, setDeckModal] = useState(false)
  const [cardModal, setCardModal] = useState(false)
  const [newDeck, setNewDeck] = useState({ name: '', subject: 'general' })
  const [newCard, setNewCard] = useState({ front: '', back: '' })

  const deck = useMemo(
    () => flashcardDecks.find((d) => d.id === selectedDeckId),
    [flashcardDecks, selectedDeckId]
  )

  const learningQueue = useMemo(() => {
    if (!deck) return []
    return deck.cards.filter((c) => c.status !== 'mastered')
  }, [deck])

  const current = learningQueue[0]
  const mastered = deck
    ? deck.cards.filter((c) => c.status === 'mastered').length
    : 0
  const total = deck?.cards.length || 0
  const pct = total ? Math.round((mastered / total) * 100) : 0

  const openFirstDeck = () => {
    if (flashcardDecks[0]) setSelectedDeckId(flashcardDecks[0].id)
  }

  const submitDeck = (e) => {
    e.preventDefault()
    const id = addDeck(newDeck.subject, newDeck.name.trim() || 'My deck')
    setSelectedDeckId(id)
    setNewDeck({ name: '', subject: 'general' })
    setDeckModal(false)
  }

  const submitCard = (e) => {
    e.preventDefault()
    if (!selectedDeckId || !newCard.front.trim() || !newCard.back.trim())
      return
    addCard(selectedDeckId, newCard.front.trim(), newCard.back.trim())
    setNewCard({ front: '', back: '' })
    setCardModal(false)
    setFlipped(false)
  }

  const onGotIt = () => {
    if (!deck || !current) return
    updateCardStatus(deck.id, current.id, 'mastered')
    setFlipped(false)
  }

  const onStillLearning = () => {
    if (!deck || !current) return
    rotateLearningCard(deck.id, current.id)
    setFlipped(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            Decks
          </h3>
          <button
            type="button"
            onClick={() => setDeckModal(true)}
            className="rounded-xl bg-indigo-600 px-3 py-1 text-xs font-extrabold text-white"
          >
            + Deck
          </button>
        </div>
        <ul className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
          {flashcardDecks.length === 0 && (
            <li className="rounded-2xl bg-slate-50 px-3 py-4 text-center text-xs font-semibold text-slate-500 dark:bg-slate-900/50">
              No decks yet — create one!
            </li>
          )}
          {flashcardDecks.map((d) => {
            const sm = subjectMeta(d.subject)
            const active = d.id === selectedDeckId
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeckId(d.id)
                    setFlipped(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-bold transition ${
                    active
                      ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{sm.emoji}</span>
                  <span className="truncate">{d.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <section className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 shadow-inner ring-1 ring-violet-100 dark:from-slate-900 dark:to-indigo-950/50 dark:ring-slate-700">
        {!selectedDeckId && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-bold text-slate-600 dark:text-slate-300">
              Pick a deck or create your first one ✨
            </p>
            <button
              type="button"
              onClick={openFirstDeck}
              className="mt-4 rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-indigo-600 shadow dark:bg-slate-800 dark:text-indigo-300"
            >
              Select first deck
            </button>
          </div>
        )}

        {deck && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {deck.name}
                </h2>
                <p className="text-sm font-semibold text-slate-500">
                  {subjectMeta(deck.subject).emoji}{' '}
                  {subjectMeta(deck.subject).label} · {deck.cards.length} cards
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCardModal(true)}
                className="rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-indigo-600 shadow dark:bg-slate-800 dark:text-indigo-300"
              >
                + Add card
              </button>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                <span>Mastered</span>
                <span>
                  {mastered} / {total} ({pct}%)
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/80 dark:bg-slate-800">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            {!current && (
              <p className="py-12 text-center font-bold text-slate-600 dark:text-slate-300">
                {total === 0
                  ? 'Add cards to start studying!'
                  : '🎉 You mastered every card in this deck!'}
              </p>
            )}

            {current && (
              <div className="mx-auto w-full max-w-md" style={{ perspective: 1200 }}>
                <motion.div
                  className="relative min-h-[240px] cursor-pointer"
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => setFlipped((f) => !f)}
                  layout
                >
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-white p-6 shadow-xl ring-2 ring-indigo-100 dark:bg-slate-800 dark:ring-indigo-900/50"
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  >
                    <p className="text-xs font-extrabold uppercase text-indigo-500">
                      Question
                    </p>
                    <p className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-100">
                      {current.front}
                    </p>
                    <p className="mt-6 text-center text-xs font-semibold text-slate-400">
                      Tap to flip
                    </p>
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-6 text-white shadow-xl"
                    initial={{ rotateY: -180 }}
                    animate={{ rotateY: flipped ? 0 : -180 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  >
                    <p className="text-xs font-extrabold uppercase text-white/80">
                      Answer
                    </p>
                    <p className="mt-3 text-lg font-bold">{current.back}</p>
                  </motion.div>
                </motion.div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onGotIt()
                    }}
                    className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg"
                  >
                    Got it ✅
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onStillLearning()
                    }}
                    className="rounded-2xl bg-amber-400 px-5 py-2.5 text-sm font-extrabold text-amber-950 shadow-lg"
                  >
                    Still learning 🔄
                  </motion.button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <AnimatePresence>
        {deckModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeckModal(false)}
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onSubmit={submitDeck}
              className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-slate-900"
            >
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                New deck
              </h3>
              <input
                className="mt-3 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="Deck name"
                value={newDeck.name}
                onChange={(e) =>
                  setNewDeck((d) => ({ ...d, name: e.target.value }))
                }
              />
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={newDeck.subject}
                onChange={(e) =>
                  setNewDeck((d) => ({ ...d, subject: e.target.value }))
                }
              >
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setDeckModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-extrabold text-white"
                >
                  Create
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cardModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCardModal(false)}
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onSubmit={submitCard}
              className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-slate-900"
            >
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                New card
              </h3>
              <textarea
                className="mt-3 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                rows={2}
                placeholder="Front (question)"
                value={newCard.front}
                onChange={(e) =>
                  setNewCard((c) => ({ ...c, front: e.target.value }))
                }
              />
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                rows={2}
                placeholder="Back (answer)"
                value={newCard.back}
                onChange={(e) =>
                  setNewCard((c) => ({ ...c, back: e.target.value }))
                }
              />
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setCardModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-extrabold text-white"
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
