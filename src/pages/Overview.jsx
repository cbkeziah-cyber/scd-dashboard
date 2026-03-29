import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Users, MousePointerClick, ShoppingCart, TrendingUp,
  Eye, Globe, AlertTriangle, Info, Package, Loader2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import {
  overviewStats, trafficOverTime, trafficSources, revenueOverTime
} from '../data/mockData'
import { useWixData } from '../hooks/useWixProducts'

const COLORS = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#06d6a0']

const issueIcon = { error: AlertTriangle, warning: AlertTriangle, info: Info }
const issueBg = { error: 'bg-red-50 border-red-100 text-red-700', warning: 'bg-amber-50 border-amber-100 text-amber-700', info: 'bg-blue-50 border-blue-100 text-blue-600' }

export default function Overview() {
  const { products, audits, collections, loading } = useWixData()
  const liveIssues = audits ? audits.flatMap(a => a.issues.map(i => ({ ...i, page: a.page, title: a.title }))) : null
  const displayIssues = liveIssues ?? []
  const criticalCount = displayIssues.filter(i => i.type === 'error').length

  return (
    <div>
      <Header
        title="SEO Overview"
        subtitle="Your site's SEO performance at a glance — last 14 days"
        badge={products ? `${products.length} products live` : null}
      />

      {/* Live store summary strip */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
          <Loader2 size={13} className="animate-spin" />
          Connecting to your Wix store...
        </div>
      ) : products && (
        <div className="flex items-center gap-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-5 py-3.5 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-blue-800">Wix Store Connected</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-700">
            <Package size={12} />
            <span><strong>{products.length}</strong> products</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-700">
            <span><strong>{collections?.length}</strong> collections</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-700">
            <span className={criticalCount > 0 ? 'text-red-600 font-semibold' : 'text-emerald-700'}>
              <strong>{criticalCount}</strong> critical SEO {criticalCount === 1 ? 'issue' : 'issues'}
            </span>
          </div>
          <Link to="/on-page" className="ml-auto text-xs text-blue-600 font-medium hover:underline">
            View full audit →
          </Link>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Organic Sessions" value={overviewStats.organicSessions.value} change={overviewStats.organicSessions.change} icon={Users} color="blue" />
        <StatCard label="Avg. CTR" value={overviewStats.avgCTR.value} change={overviewStats.avgCTR.change} unit="%" icon={MousePointerClick} color="purple" />
        <StatCard label="Avg. Position" value={overviewStats.avgPosition.value} change={overviewStats.avgPosition.change} lowerIsBetter icon={TrendingUp} color="indigo" />
        <StatCard label="Revenue" value={overviewStats.revenue.value} change={overviewStats.revenue.change} unit="$" icon={ShoppingCart} color="green" />
        <StatCard label="Total Sessions" value={overviewStats.totalSessions.value} change={overviewStats.totalSessions.change} icon={Globe} color="teal" />
        <StatCard label="Page Views" value={overviewStats.pageViews.value} change={overviewStats.pageViews.change} icon={Eye} color="orange" />
        <StatCard label="Conversions" value={overviewStats.conversions.value} change={overviewStats.conversions.change} icon={ShoppingCart} color="pink" />
        <StatCard label="Bounce Rate" value={overviewStats.bounceRate.value} change={overviewStats.bounceRate.change} unit="%" lowerIsBetter icon={TrendingUp} color="red" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Traffic Over Time */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Traffic Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trafficOverTime}>
              <defs>
                <linearGradient id="orgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4361ee" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,.07)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="organic" name="Organic" stroke="#4361ee" fill="url(#orgGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="direct" name="Direct" stroke="#7209b7" fill="none" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Area type="monotone" dataKey="social" name="Social" stroke="#f72585" fill="none" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Traffic Sources</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {trafficSources.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {trafficSources.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-slate-600">{s.name}</span>
                </div>
                <span className="font-medium text-slate-800">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue + SEO Issues Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Monthly Revenue */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueOverTime} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#4361ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SEO Issues */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              SEO Issues
              {liveIssues && <span className="ml-1.5 text-xs text-emerald-600 font-normal">● live</span>}
            </h2>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              {criticalCount} critical
            </span>
          </div>
          <div className="space-y-2">
            {displayIssues.slice(0, 5).map((issue, i) => {
              const Icon = issueIcon[issue.type] || Info
              return (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border text-xs ${issueBg[issue.type]}`}>
                  <Icon size={13} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{issue.issue}</p>
                    <p className="opacity-70 font-mono">{issue.title || issue.page}</p>
                  </div>
                </div>
              )
            })}
            {displayIssues.length === 0 && !loading && (
              <p className="text-xs text-slate-400 text-center py-4">No issues found.</p>
            )}
          </div>
          <Link to="/on-page" className="block mt-3 text-center text-xs text-blue-600 font-medium hover:underline">
            View all {displayIssues.length} issues →
          </Link>
        </div>
      </div>
    </div>
  )
}
