import { RefreshCw, Calendar, Bell } from 'lucide-react'

export default function Header({ title, subtitle, badge }) {
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
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          <Calendar size={14} />
          Jan 1 – Jan 14, 2026
        </button>
        <button className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          <RefreshCw size={15} />
        </button>
        <button className="relative p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  )
}
