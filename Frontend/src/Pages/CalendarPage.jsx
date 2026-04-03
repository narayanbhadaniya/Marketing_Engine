import { useState, useEffect } from 'react'
import { calendarAPI, brandAPI } from '../utils/api'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const PLATFORMS_FILTER = ['All','LINKEDIN','INSTAGRAM','TWITTER','EMAIL','GOOGLE']

const PLATFORM_COLORS = {
  LINKEDIN:  { bg: 'rgba(59,130,246,0.25)',  color: '#93c5fd' },
  INSTAGRAM: { bg: 'rgba(236,72,153,0.25)',  color: '#f9a8d4' },
  TWITTER:   { bg: 'rgba(14,165,233,0.25)',  color: '#7dd3fc' },
  EMAIL:     { bg: 'rgba(245,158,11,0.25)',  color: '#fcd34d' },
  GOOGLE:    { bg: 'rgba(16,185,129,0.25)',  color: '#6ee7b7' },
}

function getPlatformStyle(platform) {
  const key = (platform || '').toUpperCase().split('_')[0]
  return PLATFORM_COLORS[key] || { bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }
}

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('All')
  const [dragging, setDragging] = useState(null)
  const [suggestion, setSuggestion] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)

  useEffect(() => {
    brandAPI.getAll().then((r) => {
      setBrands(r.data)
      if (r.data.length > 0) setSelectedBrand(String(r.data[0].id))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      calendarAPI.getItems(selectedBrand).then((r) => setItems(r.data)).catch(() => {})
    }
  }, [selectedBrand])

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const dateStr = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const getItemsForDay = (day) => {
    const ds = dateStr(day)
    return items.filter((item) => {
      const platform = (item.platform || '').toUpperCase().split('_')[0]
      const match = filter === 'All' || platform === filter
      return item.scheduled_date === ds && match
    })
  }

  const unscheduled = items.filter((item) => {
    const platform = (item.platform || '').toUpperCase().split('_')[0]
    return !item.scheduled_date && (filter === 'All' || platform === filter)
  })

  const handleDrop = async (day, item) => {
    const ds = dateStr(day)
    try {
      await calendarAPI.schedule({ content_id: item.id, scheduled_date: ds, status: 'Scheduled' })
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, scheduled_date: ds, status: 'Scheduled' } : i))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const getWeekGaps = () => {
    const gaps = []
    for (let w = 0; w < 5; w++) {
      const start = w * 7 + 1
      const end = Math.min(start + 6, daysInMonth)
      if (start > daysInMonth) break
      const hasContent = Array.from({ length: end - start + 1 }, (_, i) => start + i).some(
        (d) => getItemsForDay(d).length > 0
      )
      if (!hasContent) gaps.push(`Week ${w + 1} (${MONTH_NAMES[month]} ${start}–${end})`)
    }
    return gaps
  }

  const getSuggestion = async () => {
    setLoadingSuggestion(true)
    setShowSuggestion(true)
    try {
      const res = await calendarAPI.suggest(selectedBrand)
      setSuggestion(res.data.suggestion)
    } catch (e) {
      setSuggestion('Could not load suggestion.')
    }
    setLoadingSuggestion(false)
  }

  const exportCSV = () => {
    const rows = [['Date', 'Platform', 'Type', 'Status', 'Content Preview']]
    items
      .filter((i) => i.scheduled_date)
      .forEach((i) => {
        rows.push([
          i.scheduled_date,
          i.platform || '',
          i.type || '',
          i.status || '',
          (i.content || '').replace(/\n/g, ' ').substring(0, 80),
        ])
      })
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'content_calendar.csv'
    a.click()
  }

  const weekGaps = selectedBrand ? getWeekGaps() : []

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Campaign Content Calendar</h1>
      <p className="mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Drag content pieces from the right panel onto calendar dates to schedule them.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="rounded-xl px-4 py-2 text-white text-sm outline-none"
            style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS_FILTER.map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filter === p ? '#6C3AFF' : 'rgba(255,255,255,0.05)',
                  color: filter === p ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={getSuggestion}
            className="px-4 py-2 rounded-xl text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
          >
            🤖 AI Schedule
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* AI Suggestion */}
      {showSuggestion && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'rgba(108,58,255,0.1)', border: '1px solid rgba(108,58,255,0.3)' }}
        >
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#6C3AFF' }}>
            🤖 AI Posting Schedule Recommendation
          </p>
          {loadingSuggestion ? (
            <div className="h-4 rounded animate-pulse w-3/4" style={{ background: 'rgba(255,255,255,0.1)' }} />
          ) : (
            <p className="text-sm whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {suggestion}
            </p>
          )}
        </div>
      )}

      {/* Content Gaps */}
      {weekGaps.length > 0 && (
        <div
          className="rounded-2xl p-4 mb-6"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: '#f87171' }}>
            ⚠️ Content gaps detected:
          </p>
          {weekGaps.map((g) => (
            <p key={g} className="text-xs" style={{ color: 'rgba(248,113,113,0.7)' }}>
              • You have nothing scheduled for {g}
            </p>
          ))}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1">
          <div
            className="rounded-2xl p-6"
            style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl transition-all"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <ChevronLeft size={18} />
              </button>
              <h2 className="font-display font-bold text-xl text-white">
                {MONTH_NAMES[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl transition-all"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid mb-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-xs py-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dayItems = getItemsForDay(day)
                const isToday =
                  year === now.getFullYear() &&
                  month === now.getMonth() &&
                  day === now.getDate()

                return (
                  <div
                    key={day}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (dragging) handleDrop(day, dragging)
                    }}
                    className="rounded-xl p-2 transition-all"
                    style={{
                      minHeight: '80px',
                      background: isToday ? 'rgba(108,58,255,0.15)' : 'rgba(0,0,0,0.2)',
                      border: `1px solid ${isToday ? 'rgba(108,58,255,0.5)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                  >
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: isToday ? '#6C3AFF' : 'rgba(255,255,255,0.3)' }}
                    >
                      {day}
                    </p>
                    {dayItems.map((item) => {
                      const ps = getPlatformStyle(item.platform)
                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDragging(item)}
                          className="text-xs px-2 py-1 rounded-lg mb-1 cursor-grab truncate"
                          style={{ background: ps.bg, color: ps.color }}
                          title={item.type}
                        >
                          {(item.type || '').replace(/_/g, ' ').substring(0, 12)}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Unscheduled Panel */}
        <div style={{ width: '220px', minWidth: '220px' }}>
          <div
            className="rounded-2xl p-4"
            style={{
              background: '#1A1A2E',
              border: '1px solid rgba(255,255,255,0.1)',
              position: 'sticky',
              top: '20px',
            }}
          >
            <h3 className="text-white font-semibold text-sm mb-1">Unscheduled</h3>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Drag items onto the calendar
            </p>
            <div className="space-y-2" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {unscheduled.length === 0 && (
                <p className="text-center text-xs py-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {items.length === 0 ? 'Generate content first' : 'All scheduled! ✅'}
                </p>
              )}
              {unscheduled.map((item) => {
                const ps = getPlatformStyle(item.platform)
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDragging(item)}
                    className="text-xs px-3 py-2 rounded-xl cursor-grab"
                    style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.color}33` }}
                  >
                    <p className="font-medium truncate">{(item.type || '').replace(/_/g, ' ')}</p>
                    <p className="mt-0.5 truncate" style={{ opacity: 0.6 }}>
                      {(item.content || '').substring(0, 35)}...
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Platforms
              </p>
              {Object.entries(PLATFORM_COLORS).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: val.color }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
