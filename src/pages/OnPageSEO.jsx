import { useState, useMemo, useEffect } from 'react'
import {
  AlertTriangle, Info, XCircle, CheckCircle,
  Search, ChevronDown, ChevronUp, Package, Loader2,
  AlertCircle, ExternalLink, Pencil, X, Save, Check
} from 'lucide-react'
import Header from '../components/Header'
import { useWixData } from '../hooks/useWixProducts'
import { updateProductSEO, stripHtml } from '../lib/wixApi'

const typeConfig = {
  error: { label: 'Critical', bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', badge: 'bg-red-100 text-red-700', icon: XCircle },
  warning: { label: 'Warning', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  info: { label: 'Info', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', icon: Info },
}
const impactColor = { High: 'bg-red-100 text-red-700', Medium: 'bg-amber-100 text-amber-700', Low: 'bg-slate-100 text-slate-600' }
const scoreColor = (s) => {
  if (s >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600', ring: 'ring-emerald-200' }
  if (s >= 60) return { bar: 'bg-amber-400', text: 'text-amber-600', ring: 'ring-amber-200' }
  return { bar: 'bg-red-400', text: 'text-red-600', ring: 'ring-red-200' }
}

function CharCount({ value, min, max }) {
  const len = value.length
  const ok = len >= min && len <= max
  const close = len >= min - 10 && len < min
  return (
    <span className={`text-xs font-medium ml-1 ${ok ? 'text-emerald-600' : close ? 'text-amber-500' : 'text-slate-400'}`}>
      {len}/{max}
    </span>
  )
}

function SEOEditModal({ audit, product, onClose, onSaved }) {
  const [name, setName] = useState(product?.name || audit.title || '')
  const [description, setDescription] = useState(stripHtml(product?.description) || '')
  const [metaTitle, setMetaTitle] = useState(
    product?.seoData?.tags?.find(t => t.type === 'title')?.children || product?.name || audit.title || ''
  )
  const [metaDesc, setMetaDesc] = useState(
    product?.seoData?.tags?.find(t => t.type === 'meta' && t.props?.name === 'description')?.props?.content
    || audit.metaDesc || ''
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await updateProductSEO(audit.productId, { name, description, metaTitle, metaDesc })
      setSaved(true)
      setTimeout(() => {
        onSaved({ name, description, metaTitle, metaDesc })
        onClose()
      }, 900)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit SEO</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono truncate max-w-xs">{audit.page}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Product Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Product Name
                {name.length < 30 && <span className="ml-2 text-red-500 font-normal normal-case">· aim for 30+ chars</span>}
              </label>
              <CharCount value={name} min={30} max={70} />
            </div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-800"
              placeholder="Product name (used as H1 and default meta title)"
            />
          </div>

          {/* Meta Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Meta Title <span className="text-slate-400 font-normal normal-case">(shown in Google search results)</span>
              </label>
              <CharCount value={metaTitle} min={50} max={60} />
            </div>
            <input
              value={metaTitle}
              onChange={e => setMetaTitle(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-800"
              placeholder="50–60 character title for search engines"
            />
            {/* Google preview */}
            {metaTitle && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Google preview</p>
                <p className="text-sm text-blue-700 font-medium leading-snug truncate">{metaTitle || name}</p>
                <p className="text-xs text-green-700">scdisp.com › {audit.slug}</p>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{metaDesc || 'No meta description set.'}</p>
              </div>
            )}
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Meta Description <span className="text-slate-400 font-normal normal-case">(shown below title in search results)</span>
              </label>
              <CharCount value={metaDesc} min={120} max={160} />
            </div>
            <textarea
              value={metaDesc}
              onChange={e => setMetaDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-800 resize-none"
              placeholder="120–160 character description summarizing this product for search engines"
            />
          </div>

          {/* Product Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Product Description
                {description.length > 0 && description.length < 150 && (
                  <span className="ml-2 text-amber-500 font-normal normal-case">· aim for 150+ chars</span>
                )}
              </label>
              <span className={`text-xs font-medium ${description.length >= 150 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {description.length} chars
              </span>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-800 resize-none"
              placeholder="Full product description (150+ chars for best SEO)"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <a
            href={`https://www.wix.com/dashboard/store/products/${audit.productId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition"
          >
            <ExternalLink size={12} />
            Open in Wix
          </a>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved || !name.trim()}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
              }`}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save to Wix'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuditRow({ audit, product, onEdit }) {
  const [open, setOpen] = useState(false)
  const sc = scoreColor(audit.score)

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-5 py-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <p className="font-medium text-slate-800 text-sm">{audit.title}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{audit.page}</p>
        </td>
        <td className="px-4 py-3 text-center cursor-pointer" onClick={() => setOpen(o => !o)}>
          <div className="flex justify-center">
            <div className={`w-9 h-9 rounded-full ring-2 ${sc.ring} flex items-center justify-center`}>
              <span className={`text-xs font-bold ${sc.text}`}>{audit.score}</span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <div className="flex items-center gap-1.5">
            {audit.metaDescLen >= 100 ? <CheckCircle size={13} className="text-emerald-500 shrink-0" />
              : audit.metaDescLen > 0 ? <AlertTriangle size={13} className="text-amber-500 shrink-0" />
              : <XCircle size={13} className="text-red-500 shrink-0" />}
            <span className="text-xs text-slate-500">{audit.metaDescLen > 0 ? `${audit.metaDescLen} chars` : 'Missing'}</span>
          </div>
        </td>
        <td className="px-4 py-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <div className="flex items-center gap-1.5">
            {audit.metaTitleLen >= 30 ? <CheckCircle size={13} className="text-emerald-500 shrink-0" />
              : <XCircle size={13} className="text-red-500 shrink-0" />}
            <span className="text-xs text-slate-500">{audit.metaTitleLen} chars</span>
          </div>
        </td>
        <td className="px-4 py-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <div className="flex items-center gap-1.5">
            {audit.h1 ? <CheckCircle size={13} className="text-emerald-500 shrink-0" />
              : <XCircle size={13} className="text-red-500 shrink-0" />}
            <span className="text-xs text-slate-500">{audit.h1 ? 'Set' : 'Missing'}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center cursor-pointer" onClick={() => setOpen(o => !o)}>
          <span className={`text-xs font-medium ${audit.imagesWithAlt === audit.images ? 'text-emerald-600' : 'text-amber-600'}`}>
            {audit.imagesWithAlt}/{audit.images}
          </span>
        </td>
        <td className="px-4 py-3 text-center cursor-pointer" onClick={() => setOpen(o => !o)}>
          {audit.issues.length > 0
            ? <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{audit.issues.length}</span>
            : <span className="text-xs font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">✓</span>}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(audit) }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition"
            >
              <Pencil size={11} />
              Edit
            </button>
            <span className="cursor-pointer text-slate-300 hover:text-slate-500" onClick={() => setOpen(o => !o)}>
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </div>
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-50">
          <td colSpan={8} className="px-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">SEO Title</p>
                <p className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-700 break-all">{audit.metaTitle}</p>
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
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${impactColor[issue.impact]}`}>{issue.impact}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(audit) }}
                  className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  <Pencil size={11} />
                  Fix these issues
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function OnPageSEO() {
  const { audits, products, loading, error, refresh } = useWixData()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('score_asc')
  const [editingAudit, setEditingAudit] = useState(null)

  const productMap = useMemo(() => {
    if (!products) return {}
    return Object.fromEntries(products.map(p => [p.id, p]))
  }, [products])

  const allIssues = useMemo(() => {
    if (!audits) return []
    return audits.flatMap(a => a.issues.map(i => ({ ...i, page: a.page, title: a.title })))
  }, [audits])

  const errors = allIssues.filter(i => i.type === 'error').length
  const warnings = allIssues.filter(i => i.type === 'warning').length
  const cleanCount = audits ? audits.filter(a => a.issues.length === 0).length : 0

  const filteredIssues = useMemo(() => allIssues.filter(i => {
    const matchType = filter === 'all' || i.type === filter
    const matchSearch = i.page.toLowerCase().includes(search.toLowerCase())
      || i.issue.toLowerCase().includes(search.toLowerCase())
      || i.title?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  }), [allIssues, filter, search])

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
        onRefresh={refresh}
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
              <h2 className="text-sm font-semibold text-slate-700">All Issues <span className="ml-2 text-xs font-normal text-slate-400">({filteredIssues.length})</span></h2>
              <div className="flex items-center gap-2">
                {['all', 'error', 'warning', 'info'].map(t => (
                  <button key={t} onClick={() => setFilter(t)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors capitalize ${filter === t ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
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
                    <button
                      onClick={() => {
                        const audit = audits.find(a => a.page === issue.page)
                        if (audit) setEditingAudit(audit)
                      }}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition"
                    >
                      <Pencil size={11} />
                      Fix
                    </button>
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
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                    className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 w-44" />
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none bg-white">
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
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedAudits.map((audit, i) => (
                    <AuditRow
                      key={audit.productId || i}
                      audit={audit}
                      product={productMap[audit.productId]}
                      onEdit={setEditingAudit}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit modal */}
      {editingAudit && (
        <SEOEditModal
          audit={editingAudit}
          product={productMap[editingAudit.productId]}
          onClose={() => setEditingAudit(null)}
          onSaved={() => {
            setEditingAudit(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}
