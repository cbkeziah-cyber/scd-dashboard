import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Search, ArrowUpDown } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Header from '../components/Header'
import { topKeywords, ctrOverTime } from '../data/mockData'

const positionColor = (pos) => {
  if (pos <= 3) return 'text-emerald-600 bg-emerald-50'
  if (pos <= 10) return 'text-blue-600 bg-blue-50'
  if (pos <= 20) return 'text-amber-600 bg-amber-50'
  return 'text-slate-500 bg-slate-100'
}

const PositionChange = ({ current, prev }) => {
  const diff = prev - current
  if (diff === 0) return <span className="text-slate-400 text-xs flex items-center gap-0.5"><Minus size={11} /> —</span>
  if (diff > 0) return <span className="text-emerald-600 text-xs flex items-center gap-0.5"><TrendingUp size={11} /> +{diff}</span>
  return <span className="text-red-500 text-xs flex items-center gap-0.5"><TrendingDown size={11} /> {diff}</span>
}

export default function Keywords() {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('impressions')
  const [sortDir, setSortDir] = useState('desc')

  const sorted = [...topKeywords]
    .filter(k => k.keyword.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal
    })

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }) => (
    <ArrowUpDown size={12} className={`inline ml-1 ${sortField === field ? 'text-brand-600' : 'text-slate-400'}`} />
  )

  return (
    <div>
      <Header title="Keyword Rankings" subtitle="Track your organic search positions and click performance" />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Keywords Tracked', value: topKeywords.length, sub: '↑ 3 new this month' },
          { label: 'Top 3 Positions', value: topKeywords.filter(k => k.position <= 3).length, sub: 'Ranking in position 1–3' },
          { label: 'Top 10 Positions', value: topKeywords.filter(k => k.position <= 10).length, sub: 'On first page' },
          { label: 'Avg. Position', value: (topKeywords.reduce((s, k) => s + k.position, 0) / topKeywords.length).toFixed(1), sub: '↓ improved vs last month' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* CTR Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">CTR & Impressions Over Time</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={ctrOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left" type="monotone" dataKey="ctr" name="CTR (%)" stroke="#4361ee" strokeWidth={2} dot={{ r: 3 }} />
            <Line yAxisId="right" type="monotone" dataKey="impressions" name="Impressions" stroke="#7209b7" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Keyword Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Keyword Rankings</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search keywords..."
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200 w-52"
              />
            </div>
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
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Change</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800" onClick={() => handleSort('impressions')}>
                  Impressions <SortIcon field="impressions" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800" onClick={() => handleSort('clicks')}>
                  Clicks <SortIcon field="clicks" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800" onClick={() => handleSort('ctr')}>
                  CTR <SortIcon field="ctr" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800" onClick={() => handleSort('volume')}>
                  Search Vol. <SortIcon field="volume" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Landing Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.map((kw, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{kw.keyword}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${positionColor(kw.position)}`}>
                      #{kw.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <PositionChange current={kw.position} prev={kw.prevPosition} />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{kw.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{kw.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${kw.ctr >= 6 ? 'text-emerald-600' : kw.ctr >= 4 ? 'text-blue-600' : 'text-slate-600'}`}>
                      {kw.ctr}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">{kw.volume.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono">{kw.url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
