import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { load, save } from '../lib/storage.js'

const NOTE_KEY = 'whiteboardNotes'

function StickyNote({ note, onChangeText, onMoveEnd }) {
  const drag = useRef(null)
  const start = useRef({ x: 0, y: 0, nx: 0, ny: 0 })

  const onPointerDown = (e) => {
    if (e.target.tagName === 'TEXTAREA') return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = note.id
    start.current = {
      x: e.clientX,
      y: e.clientY,
      nx: note.x,
      ny: note.y,
    }
  }

  const onPointerMove = (e) => {
    if (drag.current !== note.id) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    onMoveEnd(note.id, start.current.nx + dx, start.current.ny + dy)
  }

  const onPointerUp = (e) => {
    if (drag.current !== note.id) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    onMoveEnd(note.id, start.current.nx + dx, start.current.ny + dy)
    drag.current = null
  }

  return (
    <div
      className="absolute z-10 w-[140px] cursor-grab rounded-xl border-2 border-amber-600 bg-yellow-200 p-2 shadow-lg"
      style={{ left: note.x, top: note.y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <textarea
        className="w-full cursor-text resize-none bg-transparent text-xs font-semibold text-amber-950 outline-none"
        rows={4}
        value={note.text}
        onChange={(e) => onChangeText(note.id, e.target.value)}
      />
    </div>
  )
}

export function Whiteboard() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#6366f1')
  const [lineWidth, setLineWidth] = useState(4)
  const [drawing, setDrawing] = useState(false)
  const [notes, setNotes] = useState(() => load(NOTE_KEY, []))

  useEffect(() => {
    save(NOTE_KEY, notes)
  }, [notes])

  const getCtx = () => canvasRef.current?.getContext('2d')

  const startDraw = (e) => {
    if (e.target !== canvasRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = lineWidth
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
    }
    ctx.beginPath()
    ctx.moveTo(x, y)
    setDrawing(true)
  }

  const draw = (e) => {
    if (!drawing || e.target !== canvasRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDraw = (e) => {
    if (e.target === canvasRef.current) setDrawing(false)
    const ctx = getCtx()
    if (ctx) ctx.globalCompositeOperation = 'source-over'
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const addSticky = () => {
    setNotes((n) => [
      ...n,
      {
        id: crypto.randomUUID?.() || String(Date.now()),
        x: 40 + Math.random() * 60,
        y: 40 + Math.random() * 60,
        text: 'Note…',
      },
    ])
  }

  const updateNotePos = (id, x, y) => {
    setNotes((list) =>
      list.map((n) => (n.id === id ? { ...n, x, y } : n))
    )
  }

  const onNoteText = (id, text) => {
    setNotes((list) => list.map((n) => (n.id === id ? { ...n, text } : n)))
  }

  const paintStickiesOnCanvas = useCallback(
    (targetCtx, w, h) => {
      const wrap = wrapRef.current
      if (!wrap) return
      const scaleX = w / wrap.clientWidth
      const scaleY = h / wrap.clientHeight
      notes.forEach((note) => {
        const nx = note.x * scaleX
        const ny = note.y * scaleY
        const nw = 140 * scaleX
        const nh = 100 * scaleY
        targetCtx.save()
        targetCtx.fillStyle = '#fef08a'
        targetCtx.strokeStyle = '#ca8a04'
        targetCtx.lineWidth = Math.max(2 * scaleX, 1)
        targetCtx.beginPath()
        const r = Math.max(8 * scaleX, 2)
        if (targetCtx.roundRect) {
          targetCtx.roundRect(nx, ny, nw, nh, r)
        } else {
          targetCtx.rect(nx, ny, nw, nh)
        }
        targetCtx.fill()
        targetCtx.stroke()
        targetCtx.fillStyle = '#422006'
        targetCtx.font = `${Math.max(12, 14 * scaleY)}px sans-serif`
        const words = (note.text || '').split(' ')
        let line = ''
        let yy = ny + 22 * scaleY
        for (const word of words) {
          const test = line + word + ' '
          if (targetCtx.measureText(test).width > nw - 16 * scaleX && line) {
            targetCtx.fillText(line, nx + 10 * scaleX, yy)
            line = word + ' '
            yy += 18 * scaleY
          } else line = test
        }
        targetCtx.fillText(line, nx + 10 * scaleX, yy)
        targetCtx.restore()
      })
    },
    [notes]
  )

  const saveImage = () => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const w = canvas.width
    const h = canvas.height
    const out = document.createElement('canvas')
    out.width = w
    out.height = h
    const octx = out.getContext('2d')
    octx.fillStyle = '#ffffff'
    octx.fillRect(0, 0, w, h)
    octx.drawImage(canvas, 0, 0)
    paintStickiesOnCanvas(octx, w, h)
    const a = document.createElement('a')
    a.href = out.toDataURL('image/png')
    a.download = 'whiteboard.png'
    a.click()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const { clientWidth, clientHeight } = wrap
      canvas.width = clientWidth * dpr
      canvas.height = clientHeight * dpr
      canvas.style.width = `${clientWidth}px`
      canvas.style.height = `${clientHeight}px`
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-100 dark:bg-slate-800/90 dark:ring-slate-700">
        <span className="text-xs font-extrabold uppercase text-slate-500">
          Tool
        </span>
        <button
          type="button"
          onClick={() => setTool('pen')}
          className={`rounded-xl px-3 py-1.5 text-sm font-bold ${
            tool === 'pen'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700'
          }`}
        >
          Pen
        </button>
        <button
          type="button"
          onClick={() => setTool('eraser')}
          className={`rounded-xl px-3 py-1.5 text-sm font-bold ${
            tool === 'eraser'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700'
          }`}
        >
          Eraser
        </button>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          Color
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          Size
          <input
            type="range"
            min={1}
            max={24}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-28"
          />
        </label>
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={addSticky}
          className="rounded-xl bg-amber-400 px-3 py-1.5 text-sm font-extrabold text-amber-950"
        >
          Sticky note
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={clearCanvas}
          className="rounded-xl bg-rose-100 px-3 py-1.5 text-sm font-extrabold text-rose-800 dark:bg-rose-950 dark:text-rose-200"
        >
          Clear
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={saveImage}
          className="rounded-xl bg-emerald-500 px-3 py-1.5 text-sm font-extrabold text-white"
        >
          Save as Image
        </motion.button>
      </div>

      <div
        ref={wrapRef}
        className="relative h-[min(70vh,560px)] w-full overflow-hidden rounded-3xl bg-white shadow-inner ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onChangeText={onNoteText}
            onMoveEnd={updateNotePos}
          />
        ))}
      </div>
    </div>
  )
}
