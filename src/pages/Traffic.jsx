import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Users, Globe, Smartphone, Monitor, Tablet, TrendingUp } from 'lucide-react'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import {
  overviewStats, trafficOverTime, trafficSources, deviceBreakdown, topPages
} from '../data/mockData'

const COLORS = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#06d6a0']

const deviceIcon = { Mobile: Smartphone, Desktop: Monitor, Tablet: Tablet }

export default function Traffic() {
  return (
    <div>
      <Header title="Traffic Analytics" subtitle="Detailed breakdown of your site visitors from Wix Analytics" />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Sessions" value={overviewStats.totalSessions.value} change={overviewStats.totalSessions.change} icon={Users} color="blue" />
        <StatCard label="Organic Sessions" value={overviewStats.organicSessions.value} change={overviewStats.organicSessions.change} icon={Globe} color="purple" />
        <StatCard label="Page Views" value={overviewStats.pageViews.value} change={overviewStats.pageViews.change} icon={TrendingUp} color="indigo" />
        <StatCard label="Bounce Rate" value={overviewStats.bounceRate.value} change={overviewStats.bounceRate.change} unit="%" lowerIsBetter icon={TrendingUp} color="red" />
      </div>

      {/* Traffic Over Time */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Sessions Over Time — All Channels</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trafficOverTime}>
            <defs>
              {['orgGrad', 'dirGrad', 'socGrad', 'refGrad'].map((id, i) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,.07)' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="organic" name="Organic" stroke={COLORS[0]} fill="url(#orgGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="direct" name="Direct" stroke={COLORS[1]} fill="url(#dirGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="social" name="Social" stroke={COLORS[2]} fill="url(#socGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="referral" name="Referral" stroke={COLORS[3]} fill="url(#refGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sources + Devices */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Traffic Sources Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Traffic Sources</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trafficSources} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="value" name="Share" radius={[0, 4, 4, 0]}>
                {trafficSources.map((entry, index) => (
                  <rect key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-5">Device Breakdown</h2>
          <div className="space-y-5">
            {deviceBreakdown.map((d, i) => {
              const Icon = deviceIcon[d.name] || Monitor
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon size={15} className="text-slate-500" />
                      <span className="text-sm text-slate-700 font-medium">{d.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">{d.pct}%</span>
                      <span className="text-xs text-slate-400 ml-2">{d.sessions.toLocaleString()} sessions</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${d.pct}%`, background: COLORS[i] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Top Pages by Traffic</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Page</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sessions</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Organic Sessions</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Organic %</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg. Position</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topPages.map((p, i) => {
                const organicPct = ((p.organicSessions / p.sessions) * 100).toFixed(0)
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{p.title}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{p.page}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">{p.sessions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{p.organicSessions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${organicPct}%` }} />
                        </div>
                        <span className="text-slate-600 text-xs w-8 text-right">{organicPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        p.avgPosition <= 10 ? 'bg-emerald-50 text-emerald-700' :
                        p.avgPosition <= 20 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        #{p.avgPosition}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{p.ctr}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
