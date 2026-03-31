import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Users, MousePointerClick, ShoppingCart, TrendingUp,
  Eye, Globe, AlertTriangle, Info, Package, Loader2, Search
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import { trafficOverTime, trafficSources } from '../data/mockData'
import { useWixData } from '../hooks/useWixProducts'
import { useGoogleData } from '../hooks/useGoogleData'

const COLORS = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#06d6a0']

const issueIcon = { error: AlertTriangle, warning: AlertTriangle, info: Info }
const issueBg = { error: 'bg-red-50 border-red-100 text-red-700', warning: 'bg-amber-50 border-amber-100 text-amber-700', info: 'bg-blue-50 border-blue-100 text-blue-600' }

function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export default function Overview() {
  const { products, audits, collections, orderStats, loading: wixLoading, refresh: wixRefresh } = useWixData()
  const {
    isConnected, ga4Stats, ga4TrafficOverTime, ga4Channels,
    gscKeywords, loading: gscLoading, ga4Loading, connect, refresh: googleRefresh,
  } = useGoogleData()

  const handleRefresh = () => {
    wixRefresh()
    if (isConnected) googleRefresh()
  }

  // GSC aggregate stats
  const gscStats = gscKeywords?.length > 0 ? {
    totalClicks: gscKeywords.reduce((s, k) => s + k.clicks, 0),
    totalImpressions: gscKeywords.reduce((s, k) => s + k.impressions, 0),
    avgCTR: Math.round(gscKeywords.reduce((s, k) => s + k.ctr, 0) / gscKeywords.length * 10) / 10,
    avgPosition: Math.round(gscKeywords.reduce((s, k) => s + k.position, 0) / gscKeywords.length * 10) / 10,
  } : null

  // SEO issues from Wix product audit
  const liveIssues = audits ? audits.flatMap(a => a.issues.map(i => ({ ...i, page: a.page, title: a.title }))) : null
  const displayIssues = liveIssues ?? []
  const criticalCount = displayIssues.filter(i => i.type === 'error').length

  // Charts data — real if available, mock fallback
  const trafficData = ga4TrafficOverTime?.length > 0 ? ga4TrafficOverTime : trafficOverTime
  const sourcesData = ga4Channels?.length > 0 ? ga4Channels : trafficSources
  const isLiveTraffic = ga4TrafficOverTime?.length > 0
  const isLiveSources = ga4Channels?.length > 0

  // Date label for last 28 days
  const today = new Date()
  const start = new Date(today - 29 * 86400000)
  const end = new Date(today - 86400000)
  const dateLabel = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <div>
      <Header
        title="SEO Overview"
        subtitle="Your site's SEO performance at a glance"
        badge={products ? `${products.length} products live` : null}
        dateLabel={dateLabel}
        onRefresh={handleRefresh}
        loading={gscLoading || ga4Loading || wixLoading}
      />

      {/* Wix store strip */}
      {wixLoading ? (
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

      {/* Google not connected notice */}
      {!isConnected && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-5">
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <Search size={13} />
            <span>Connect Google to see real search data — clicks, impressions, CTR, position, sessions</span>
          </div>
          <button onClick={connect} className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition">
            Connect Google
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Organic Clicks (GSC) */}
        <StatCard
          label={gscStats ? 'Organic Clicks' : 'Organic Sessions'}
          value={gscStats ? fmt(gscStats.totalClicks) : '—'}
          change={null}
          icon={Users}
          color="blue"
          live={!!gscStats}
        />
        {/* Avg CTR (GSC) */}
        <StatCard
          label="Avg. CTR"
          value={gscStats ? `${gscStats.avgCTR}%` : '—'}
          change={null}
          icon={MousePointerClick}
          color="purple"
          live={!!gscStats}
        />
        {/* Avg Position (GSC) */}
        <StatCard
          label="Avg. Position"
          value={gscStats ? gscStats.avgPosition : '—'}
          change={null}
          lowerIsBetter
          icon={TrendingUp}
          color="indigo"
          live={!!gscStats}
        />
        {/* Revenue (Wix) */}
        {orderStats ? (
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-emerald-600 font-medium">Total Revenue</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">Live</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-600">
                  <ShoppingCart size={16} />
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-800 mb-1.5">
              ${orderStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-emerald-600">{orderStats.totalOrders} paid orders · ${Math.round(orderStats.avgOrderValue)} AOV</p>
          </div>
        ) : (
          <StatCard label="Revenue" value="—" icon={ShoppingCart} color="green" />
        )}

        {/* Total Sessions (GA4) */}
        <StatCard
          label="Total Sessions"
          value={ga4Stats ? fmt(ga4Stats.sessions.value) : '—'}
          change={ga4Stats?.sessions.change}
          icon={Globe}
          color="teal"
          live={!!ga4Stats}
        />
        {/* Page Views (GA4) */}
        <StatCard
          label="Page Views"
          value={ga4Stats ? fmt(ga4Stats.pageViews.value) : '—'}
          change={ga4Stats?.pageViews.change}
          icon={Eye}
          color="orange"
          live={!!ga4Stats}
        />
        {/* Orders (Wix) */}
        {orderStats ? (
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-slate-500 font-medium">Total Orders</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">Live</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                  <ShoppingCart size={16} />
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1.5">{orderStats.totalOrders}</p>
            <p className="text-xs text-slate-400">{orderStats.latestMonthLabel}: {orderStats.latestMonthOrders} orders</p>
          </div>
        ) : (
          <StatCard label="Orders" value="—" icon={ShoppingCart} color="pink" />
        )}
        {/* Bounce Rate (GA4) */}
        <StatCard
          label="Bounce Rate"
          value={ga4Stats ? `${ga4Stats.bounceRate.value}%` : '—'}
          change={ga4Stats?.bounceRate.change}
          lowerIsBetter
          icon={TrendingUp}
          color="red"
          live={!!ga4Stats}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Traffic Over Time */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Traffic Over Time</h2>
            {isLiveTraffic && (
              <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Live — GA4
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trafficData}>
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

        {/* Traffic Sources */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Traffic Sources</h2>
            {isLiveSources && (
              <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Live
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={sourcesData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {sourcesData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {sourcesData.slice(0, 5).map((s, i) => (
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
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Monthly Revenue</h2>
            {orderStats && <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Live — Wix Orders</span>}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={orderStats ? orderStats.revenueByMonth.slice(-12) : []} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v, name) => name === 'Revenue' ? `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : v} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#4361ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {!orderStats && !wixLoading && (
            <p className="text-xs text-slate-400 text-center py-4">Wix store data loading...</p>
          )}
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
            {displayIssues.length === 0 && !wixLoading && (
              <p className="text-xs text-slate-400 text-center py-4">
                {products ? 'No issues found.' : 'Loading store data...'}
              </p>
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
