import { useState, useMemo } from 'react'
import {
  AlertTriangle, Info, XCircle, CheckCircle,
  Search, ChevronDown, ChevronUp, Package, Loader2, AlertCircle, ExternalLink
} from 'lucide-react'
import Header from '../components/Header'
import { useWixData } from '../hooks/useWixProducts'

const typeConfig = {
  error: {
    label: 'Critical',
    bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700',
    badge: 'bg-red-100 text-red-700', icon: XCircle,
  },
  warning: {
    label: 'Warning',
    bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700', icon: AlertTriangle,
  },
  info: {
    label: 'Info',
    bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700', icon: Info,
  },
}

const impactColor = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-slate-100 text-slate-600',
}

const scoreColor = (s) => {
  if (s >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600', ring: 'ring-emerald-200' }
  if (s >= 60) return { bar: 'bg-amber-400', text: 'text-amber-600', ring: 'ring-amber-200' }
  return { bar: 'bg-red-400', text: 'text-red-600', ring: 'ring-red-200' }
}

function AuditRow({ audit }) {
  const [open, setOpen] = useState(false)
  const sc = scoreColor(audit.score)

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setOpen(o => !o)}>
        <td className="px-5 py-3">
          <p className="font-medium text-slate-800 text-sm">{audit.title}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{audit.page}</p>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex justify-center">
            <div className={`w-9 h-9 rounded-full ring-2 ${sc.ring} flex items-center justify-center`}>
              <span className={`text-xs font-bold ${sc.text}`}>{audit.score}</span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {audit.metaDescLen >= 100
              ? <CheckCircle size={13} className="text-emerald-500 shrink-0" />
              : audit.metaDescLen > 0
              ? <AlertTriangle size={13} className="text-amber-500 shrink-0" />
              : <XCircle size={13} className="text-red-500 shrink-0" />}
            <span className="text-xs text-slate-500">
              {audit.metaDescLen > 0 ? `${audit.metaDescLen} chars` : 'Missing'}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {audit.metaTitleLen >= 30
              ? <CheckCircle size={13} className="text-emerald-500 shrink-0" />
              : <XCircle size={13} className="text-red-500 shrink-0" />}
            <span className="text-xs text-slate-500">{audit.metaTitleLen} chars</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {audit.h1
              ? <CheckCircle size={13} className="text-emerald-500 shrink-0" />
              : <XCircle size={13} className="text-red-500 shrink-0" />}
            <span className="text-xs text-slate-500 truncate max-w-[140px]">{audit.h1 ? 'Set' : 'Missing'}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`text-xs font-medium ${audit.imagesWithAlt === audit.images ? 'text-emerald-600' : 'text-amber-600'}`}>
            {audit.imagesWithAlt}/{audit.images}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          {audit.issues.length > 0
            ? <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{audit.issues.length}</span>
            : <span className="text-xs font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">✓</span>}
        </td>
        <td className="px-4 py-3 text-center text-slate-400">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-50">
          <td colSpan={8} className="px-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">SEO Title (Product Name)</p>
                <p className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-700 break-all">
                  {audit.metaTitle}
                </p>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mt-2">Description Preview</p>
                <p className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 leading-relaxed">
                  {audit.metaDesc || <span className="text-red-400 italic">No description set</span>}
                </p>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mt-2">Price</p>
                <p className="text-sm font-bold text-slate-800">{audit.price || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Issues Found</p>
                {audit.issues.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm">
                    <CheckCircle size={14} />
                    No issues — this product page looks great!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {audit.issues.map((issue, i) => {
                      const cfg = typeConfig[issue.type]
                      const Icon = cfg.icon
                      return (
                        <div key={i} className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                          <Icon size={12} className="mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <span>{issue.issue}</span>
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${impactColor[issue.impact]}`}>
                              {issue.impact}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <a
                  href={`https://manage.wix.com/premium-purchase-plan/dynamo`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-xs text-blue-600 hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink size={11} />
                  Edit in Wix
                </a>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function OnPageSEO() {
  const { audits, products, loading, error } = useWixData()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('score_asc')

  const allIssues = useMemo(() => {
    if (!audits) return []
    return audits.flatMap(a => a.issues.map(i => ({ ...i, page: a.page, title: a.title })))
  }, [audits])

  const errors = allIssues.filter(i => i.type === 'error').length
  const warnings = allIssues.filter(i => i.type === 'warning').length
  const infos = allIssues.filter(i => i.type === 'info').length
  const cleanCount = audits ? audits.filter(a => a.issues.length === 0).length : 0

  const filteredIssues = useMemo(() => {
    return allIssues.filter(i => {
      const matchType = filter === 'all' || i.type === filter
      const matchSearch = i.page.toLowerCase().includes(search.toLowerCase()) ||
        i.issue.toLowerCase().includes(search.toLowerCase()) ||
        i.title?.toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    })
  }, [allIssues, filter, search])

  const sortedAudits = useMemo(() => {
    if (!audits) return []
    let list = [...audits]
    if (sortBy === 'score_asc') list.sort((a, b) => a.score - b.score)
    if (sortBy === 'score_desc') list.sort((a, b) => b.score - a.score)
    if (sortBy === 'issues') list.sort((a, b) => b.issues.length - a.issues.length)
    if (sortBy === 'name') list.sort((a, b) => a.title.localeCompare(b.title))
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.page.toLowerCase().includes(q))
    }
    return list
  }, [audits, sortBy, search])

  const avgScore = audits ? Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length) : null

  return (
    <div>
      <Header
        title="On-Page SEO"
        subtitle="Live audit of your Wix store product pages"
        badge={products ? `${products.length} pages audited` : null}
      />

      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Fetching and auditing your Wix products...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} />
          Failed to load Wix data: {error}
        </div>
      )}

      {!loading && !error && audits && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Avg. SEO Score', value: avgScore, suffix: '/100', bg: avgScore >= 80 ? 'bg-emerald-50 border-emerald-100' : avgScore >= 60 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100', textColor: avgScore >= 80 ? 'text-emerald-700' : avgScore >= 60 ? 'text-amber-700' : 'text-red-700' },
              { label: 'Critical Issues', value: errors, suffix: '', bg: errors > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100', textColor: errors > 0 ? 'text-red-600' : 'text-slate-500', clickType: 'error' },
              { label: 'Warnings', value: warnings, suffix: '', bg: warnings > 0 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100', textColor: warnings > 0 ? 'text-amber-600' : 'text-slate-500', clickType: 'warning' },
              { label: 'Pages No Issues', value: cleanCount, suffix: `/${audits.length}`, bg: 'bg-emerald-50 border-emerald-100', textColor: 'text-emerald-700' },
            ].map((s, i) => (
              <button
                key={i}
                onClick={() => s.clickType && setFilter(filter === s.clickType ? 'all' : s.clickType)}
                className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${s.bg} ${s.clickType ? 'cursor-pointer' : 'cursor-default'} ${filter === s.clickType ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${s.textColor} opacity-80`}>{s.label}</p>
                <p className={`text-3xl font-bold ${s.textColor}`}>{s.value}<span className="text-lg opacity-60">{s.suffix}</span></p>
              </button>
            ))}
          </div>

          {/* Issues list */}
          <div className="bg-white rounded-xl border border-slate-200 mb-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">
                All Issues
                <span className="ml-2 text-xs font-normal text-slate-400">({filteredIssues.length})</span>
              </h2>
              <div className="flex items-center gap-2">
                {['all', 'error', 'warning', 'info'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors capitalize ${
                      filter === t ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t === 'all' ? 'All' : t === 'error' ? 'Critical' : t === 'warning' ? 'Warnings' : 'Info'}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {filteredIssues.map((issue, i) => {
                const cfg = typeConfig[issue.type]
                const Icon = cfg.icon
                return (
                  <div key={i} className="flex items-start gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className={`mt-0.5 p-1.5 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                      <Icon size={13} className={cfg.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${impactColor[issue.impact]}`}>{issue.impact}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700">{issue.issue}</p>
                      <p className="text-xs text-slate-400 font-mono">{issue.title} · {issue.page}</p>
                    </div>
                  </div>
                )
              })}
              {filteredIssues.length === 0 && (
                <div className="py-8 text-center">
                  <CheckCircle size={24} className="mx-auto mb-2 text-emerald-300" />
                  <p className="text-sm text-slate-400">No issues in this category.</p>
                </div>
              )}
            </div>
          </div>

          {/* Product audit table */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Product Page Audit</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 w-44"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none bg-white"
                >
                  <option value="score_asc">Worst first</option>
                  <option value="score_desc">Best first</option>
                  <option value="issues">Most issues</option>
                  <option value="name">A–Z</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title Len</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">H1</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Alt Text</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Issues</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedAudits.map((audit, i) => (
                    <AuditRow key={i} audit={audit} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
