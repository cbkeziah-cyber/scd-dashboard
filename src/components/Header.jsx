import { useState, useRef, useEffect } from 'react'
import { RefreshCw, Calendar, Bell, ChevronDown } from 'lucide-react'

const RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 28 days', days: 28 },
  { label: 'Last 90 days', days: 90 },
]

export default function Header({ title, subtitle, badge, onRefresh, loading = false }) {
  const [spinning, setSpinning] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedDays, setSelectedDays] = useState(28)
  const dropRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleRefresh() {
    if (spinning) return
    setSpinning(true)
    onRefresh?.()
    setTimeout(() => setSpinning(false), 1500)
  }

  const today = new Date()
  const start = new Date(today - (selectedDays + 1) * 86400000)
  const end = new Date(today - 86400000)
  const dateLabel = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {badge && (
            <span className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {/* Date range picker */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <Calendar size={14} />
            {dateLabel}
            <ChevronDown size={12} className={`ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 min-w-[160px]">
              {RANGES.map(r => (
                <button
                  key={r.days}
                  onClick={() => { setSelectedDays(r.days); setOpen(false) }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition ${selectedDays === r.days ? 'text-blue-600 font-semibold' : 'text-slate-700'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={spinning || loading}
          className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw size={15} className={spinning || loading ? 'animate-spin' : ''} />
        </button>

        <button className="relative p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  )
}
