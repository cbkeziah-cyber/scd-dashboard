import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Users, Globe, Smartphone, Monitor, Tablet, TrendingUp, Loader2, Link2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import { useGoogleData } from '../hooks/useGoogleData'
import { trafficOverTime, trafficSources, deviceBreakdown, topPages, overviewStats } from '../data/mockData'

const COLORS = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#06d6a0']
const deviceIcon = { Mobile: Smartphone, Desktop: Monitor, Tablet: Tablet }

function ConnectPrompt({ connect }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
        <Globe size={24} className="text-blue-500" />
      </div>
      <div>
        <p className="text-slate-800 font-semibold mb-1">Connect Google Analytics</p>
        <p className="text-sm text-slate-400 max-w-sm">See real sessions, traffic sources, device breakdown and top pages from GA4.</p>
      </div>
      <button onClick={connect} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition">
        <Link2 size={15} /> Connect Google
      </button>
      <Link to="/settings" className="text-xs text-slate-400 hover:text-slate-600 underline">or go to Settings</Link>
    </div>
  )
}

export default function Traffic() {
  const {
    isConnected, hasGA4,
    ga4Stats, ga4TrafficOverTime, ga4Channels, ga4Devices, ga4Pages,
    gscPages,
    loading, ga4Loading, error,
    connect,
  } = useGoogleData()

  const liveLabel = (
    <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 ml-auto">
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Live — GA4
    </span>
  )

  // Merge GSC pages with GA4 pages
  const mergedPages = (() => {
    if (!ga4Pages) return gscPages || topPages
    const gscMap = {}
    if (gscPages) gscPages.forEach((p) => { gscMap[p.page] = p })
    return ga4Pages.map((p) => ({
      ...p,
      title: p.page,
      sessions: p.sessions,
      organicSessions: gscMap[p.page]?.clicks || 0,
      avgPosition: gscMap[p.page]?.position || null,
      ctr: gscMap[p.page]?.ctr || null,
    }))
  })()

  const stats = ga4Stats || null
  const channels = ga4Channels || trafficSources
  const devices = ga4Devices || deviceBreakdown
  const chartData = ga4TrafficOverTime || trafficOverTime

  return (
    <div>
      <Header
        title="Traffic Analytics"
        subtitle={isConnected && hasGA4 ? 'Real data from Google Analytics · last 28 days' : 'Detailed breakdown of your site visitors'}
        badge={isConnected && hasGA4 ? 'Live — GA4' : null}
      />

      {!isConnected ? (
        <ConnectPrompt connect={connect} />
      ) : isConnected && !hasGA4 ? (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700 mb-6">
          Google connected but no GA4 property selected. <Link to="/settings" className="underline font-medium">Go to Settings</Link> to pick your GA4 property.
        </div>
      ) : null}

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      )}

      {(loading || ga4Loading) && isConnected && (
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4">
          <Loader2 size={13} className="animate-spin" />
          Loading analytics data…
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats ? (
          <>
            <StatCard label="Total Sessions" value={stats.sessions.value.toLocaleString()} change={stats.sessions.change} icon={Users} color="blue" />
            <StatCard label="New Users" value={stats.newUsers.value.toLocaleString()} change={stats.newUsers.change} icon={Globe} color="purple" />
            <StatCard label="Page Views" value={stats.pageViews.value.toLocaleString()} change={stats.pageViews.change} icon={TrendingUp} color="indigo" />
            <StatCard label="Bounce Rate" value={stats.bounceRate.value} change={stats.bounceRate.change} unit="%" lowerIsBetter icon={TrendingUp} color="red" />
          </>
        ) : (
          <>
            <StatCard label="Total Sessions" value={overviewStats.totalSessions.value} change={overviewStats.totalSessions.change} icon={Users} color="blue" />
            <StatCard label="Organic Sessions" value={overviewStats.organicSessions.value} change={overviewStats.organicSessions.change} icon={Globe} color="purple" />
            <StatCard label="Page Views" value={overviewStats.pageViews.value} change={overviewStats.pageViews.change} icon={TrendingUp} color="indigo" />
            <StatCard label="Bounce Rate" value={overviewStats.bounceRate.value} change={overviewStats.bounceRate.change} unit="%" lowerIsBetter icon={TrendingUp} color="red" />
          </>
        )}
      </div>

      {/* Traffic Over Time */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Sessions Over Time</h2>
          {ga4TrafficOverTime && liveLabel}
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              {['orgGrad', 'dirGrad', 'socGrad', 'refGrad'].map((id, i) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={6} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
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
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Traffic Sources</h2>
            {ga4Channels && liveLabel}
          </div>
          <div className="space-y-3">
            {channels.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">{s.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">{s.value}%</span>
                    {s.sessions && <span className="text-xs text-slate-400 ml-2">{s.sessions.toLocaleString()} sessions</span>}
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-700">Device Breakdown</h2>
            {ga4Devices && liveLabel}
          </div>
          <div className="space-y-5">
            {devices.map((d, i) => {
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
                    <div className="h-full rounded-full transition-all" style={{ width: `${d.pct}%`, background: COLORS[i] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Top Pages by Traffic</h2>
          {ga4Pages && liveLabel}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Page</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sessions</th>
                {gscPages && <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">GSC Clicks</th>}
                {gscPages && <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg. Position</th>}
                {gscPages && <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">CTR</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mergedPages.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{p.title || p.page}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{p.page}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{(p.sessions || 0).toLocaleString()}</td>
                  {gscPages && <td className="px-4 py-3 text-right text-slate-700">{(p.organicSessions || 0).toLocaleString()}</td>}
                  {gscPages && (
                    <td className="px-4 py-3 text-right">
                      {p.avgPosition ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${p.avgPosition <= 10 ? 'bg-emerald-50 text-emerald-700' : p.avgPosition <= 20 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                          #{p.avgPosition}
                        </span>
                      ) : '—'}
                    </td>
                  )}
                  {gscPages && <td className="px-4 py-3 text-right font-medium text-slate-700">{p.ctr != null ? `${p.ctr}%` : '—'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
