import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Search, ArrowUpDown, Loader2, Link2 } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { useGoogleData } from '../hooks/useGoogleData'

const positionColor = (pos) => {
  if (pos <= 3) return 'text-emerald-600 bg-emerald-50'
  if (pos <= 10) return 'text-blue-600 bg-blue-50'
  if (pos <= 20) return 'text-amber-600 bg-amber-50'
  return 'text-slate-500 bg-slate-100'
}

export default function Keywords() {
  const { isConnected, gscKeywords, gscOverTime, loading, error, connect } = useGoogleData()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('impressions')
  const [sortDir, setSortDir] = useState('desc')

  const keywords = gscKeywords || []

  const sorted = [...keywords]
    .filter((k) => k.keyword.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField], bVal = b[sortField]
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal
    })

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }) => (
    <ArrowUpDown size={12} className={`inline ml-1 ${sortField === field ? 'text-brand-600' : 'text-slate-400'}`} />
  )

  const avgPosition = keywords.length
    ? (keywords.reduce((s, k) => s + k.position, 0) / keywords.length).toFixed(1)
    : '—'

  if (!isConnected) {
    return (
      <div>
        <Header title="Keyword Rankings" subtitle="Real keyword data from Google Search Console" />
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Search size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-slate-800 font-semibold mb-1">Connect Google Search Console</p>
            <p className="text-sm text-slate-400 max-w-sm">See your real keyword rankings, impressions, CTR and search positions from GSC.</p>
          </div>
          <button onClick={connect} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition">
            <Link2 size={15} /> Connect Google
          </button>
          <Link to="/settings" className="text-xs text-slate-400 hover:text-slate-600 underline">or go to Settings</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <Header title="Keyword Rankings" subtitle="Real keyword data from Google Search Console" />
        <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading your keyword data from Search Console…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Header title="Keyword Rankings" subtitle="Real keyword data from Google Search Console" />
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Keyword Rankings"
        subtitle="Real data from Google Search Console · last 28 days"
        badge={keywords.length ? `${keywords.length} keywords` : null}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Keywords Found', value: keywords.length, sub: 'from Search Console' },
          { label: 'Top 3 Positions', value: keywords.filter((k) => k.position <= 3).length, sub: 'Ranking in position 1–3' },
          { label: 'Top 10 Positions', value: keywords.filter((k) => k.position <= 10).length, sub: 'On first page' },
          { label: 'Avg. Position', value: avgPosition, sub: 'across all keywords' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* CTR / Impressions chart */}
      {gscOverTime && gscOverTime.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">CTR & Impressions Over Time</h2>
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Live — GSC
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={gscOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={6} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="ctr" name="CTR (%)" stroke="#4361ee" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="impressions" name="Impressions" stroke="#7209b7" strokeWidth={2} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Keyword Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">
            Keyword Rankings
            <span className="ml-2 text-xs font-normal text-emerald-600">● live</span>
          </h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keywords..."
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200 w-52"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Keyword</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800" onClick={() => handleSort('position')}>
                  Position <SortIcon field="position" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800" onClick={() => handleSort('impressions')}>
                  Impressions <SortIcon field="impressions" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800" onClick={() => handleSort('clicks')}>
                  Clicks <SortIcon field="clicks" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800" onClick={() => handleSort('ctr')}>
                  CTR <SortIcon field="ctr" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">No keywords found.</td></tr>
              ) : sorted.map((kw, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{kw.keyword}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${positionColor(kw.position)}`}>
                      #{kw.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{kw.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{kw.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${kw.ctr >= 6 ? 'text-emerald-600' : kw.ctr >= 4 ? 'text-blue-600' : 'text-slate-600'}`}>
                      {kw.ctr}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
