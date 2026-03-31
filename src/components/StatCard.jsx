import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ label, value, change, unit = '', lowerIsBetter = false, icon: Icon, color = 'blue', live = false }) {
  const isPositive = lowerIsBetter ? change < 0 : change > 0
  const isNeutral = change === 0
  const displayValue = (value === '—' || value == null)
    ? '—'
    : unit === '$'
    ? `$${Number(value).toLocaleString()}`
    : unit === '%'
    ? `${value}%`
    : typeof value === 'number' ? value.toLocaleString() : value

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    pink: 'bg-pink-50 text-pink-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    teal: 'bg-teal-50 text-teal-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <div className="flex items-center gap-1.5">
          {live && <span className="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">Live</span>}
          {Icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
              <Icon size={16} />
            </div>
          )}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1.5">{displayValue}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${
          isNeutral ? 'text-slate-400' : isPositive ? 'text-emerald-600' : 'text-red-500'
        }`}>
          {isNeutral ? <Minus size={12} /> : isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(change)}{unit === '%' ? 'pp' : '%'} vs last period</span>
        </div>
      )}
    </div>
  )
}
