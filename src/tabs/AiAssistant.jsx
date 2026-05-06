import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MODEL = 'claude-sonnet-4-20250514'

/** Dev: Vite proxy. Production (e.g. Vercel): `api/study-assistant.js` serverless. */
const STUDY_API = '/api/study-assistant'

function TypingDots() {
  return (
    <div className="flex gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-indigo-400"
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.12,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm your study buddy. Use the quick actions or ask me anything below.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() =>
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    )
  }

  const sendMessages = async (userContent) => {
    let next = []
    setMessages((m) => {
      next = [...m, { role: 'user', content: userContent }]
      return next
    })
    setInput('')
    setLoading(true)
    scrollToBottom()

    try {
      const res = await fetch(STUDY_API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2048,
          messages: next.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const err =
          data?.error?.message || data?.message || res.statusText || 'Request failed'
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: `⚠️ ${err}` },
        ])
        return
      }
      const text =
        data?.content?.[0]?.text ||
        data?.content?.map?.((c) => c.text).join('') ||
        'No response text.'
      setMessages((m) => [...m, { role: 'assistant', content: text }])
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: `⚠️ Network error: ${e.message || String(e)}`,
        },
      ])
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const t = input.trim()
    if (!t || loading) return
    sendMessages(t)
  }

  const quickSummarize = () => {
    const notes = window.prompt('Paste your notes here:')
    if (!notes?.trim()) return
    sendMessages(
      `Summarize the following notes as clean bullet points. Use concise headings where helpful.\n\n---\n\n${notes.trim()}`
    )
  }

  const quickQuiz = () => {
    const text = window.prompt('Paste text to be quizzed on:')
    if (!text?.trim()) return
    sendMessages(
      `From the following text, create exactly 5 multiple-choice questions. For each question, output: the question, 4 labeled options (A-D), the correct letter, and a one-line explanation. Use clear formatting.\n\n---\n\n${text.trim()}`
    )
  }

  const quickExplain = () => {
    const topic = window.prompt('What topic should I explain?')
    if (!topic?.trim()) return
    sendMessages(
      `Explain this topic in simple terms for a student. Use short paragraphs and an analogy if it helps.\n\nTopic: ${topic.trim()}`
    )
  }

  return (
    <div className="mx-auto flex h-[min(72vh,640px)] max-w-3xl flex-col gap-4">
      <p className="rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-2 text-xs font-semibold text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-100">
        Local: add <code className="rounded bg-white/90 px-1 dark:bg-slate-800">ANTHROPIC_API_KEY</code> to{' '}
        <code className="rounded bg-white/90 px-1 dark:bg-slate-800">.env.local</code>. Hosted: set the same variable
        in your host (e.g. Vercel → Environment Variables).
      </p>

      <div className="flex flex-wrap gap-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          onClick={quickSummarize}
          className="rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-500 px-4 py-2 text-sm font-extrabold text-white shadow-md disabled:opacity-50"
        >
          📝 Summarize my notes
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          onClick={quickQuiz}
          className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-extrabold text-white shadow-md disabled:opacity-50"
        >
          🧠 Quiz me
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          onClick={quickExplain}
          className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-extrabold text-white shadow-md disabled:opacity-50"
        >
          ❓ Explain this topic
        </motion.button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white'
                      : 'bg-white text-slate-800 ring-1 ring-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-600">
                <TypingDots />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="flex gap-2 border-t border-slate-200 bg-white/90 p-3 dark:border-slate-700 dark:bg-slate-900/90"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask anything…"
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none ring-indigo-200 focus:ring-2 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-extrabold text-white shadow disabled:opacity-50"
          >
            Send
          </motion.button>
        </form>
      </div>
    </div>
  )
}
