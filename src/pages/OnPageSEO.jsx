import { useState } from 'react'
import {
  AlertTriangle, Info, CheckCircle, XCircle, Search,
  FileText, Image, Link, Gauge, Tag, ChevronDown, ChevronUp
} from 'lucide-react'
import Header from '../components/Header'
import { seoIssues, topPages } from '../data/mockData'

const typeConfig = {
  error: {
    label: 'Critical',
    bg: 'bg-red-50',
    border: 'border-red-100',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  warning: {
    label: 'Warning',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    icon: AlertTriangle,
  },
  info: {
    label: 'Info',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    icon: Info,
  },
}

const impactColor = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-slate-100 text-slate-600',
}

// Extended page audit data
const pageAudits = [
  {
    page: '/',
    title: 'Home',
    score: 61,
    metaTitle: 'Handmade Ceramics & Pottery | Shop Online',
    metaTitleLen: 46,
    metaDesc: 'Discover our collection of handmade ceramic mugs, bowls and dinnerware.',
    metaDescLen: 71,
    h1: 'Welcome to Our Pottery Studio',
    images: 6,
    imagesWithAlt: 6,
    internalLinks: 12,
    issues: ['Page speed score: 61/100 (mobile)'],
  },
  {
    page: '/shop',
    title: 'Shop All',
    score: 78,
    metaTitle: 'Shop Handmade Ceramics & Pottery Online',
    metaTitleLen: 42,
    metaDesc: 'Browse our full collection of artisan ceramics including mugs, bowls, plates and gifts.',
    metaDescLen: 87,
    h1: 'Shop All Ceramics',
    images: 24,
    imagesWithAlt: 24,
    internalLinks: 34,
    issues: [],
  },
  {
    page: '/shop/mugs',
    title: 'Ceramic Mugs',
    score: 85,
    metaTitle: 'Handmade Ceramic Mugs | Artisan Coffee Mugs',
    metaTitleLen: 46,
    metaDesc: 'Shop handcrafted ceramic mugs for coffee and tea. Unique designs, made by hand.',
    metaDescLen: 80,
    h1: 'Handmade Ceramic Mugs',
    images: 18,
    imagesWithAlt: 18,
    internalLinks: 12,
    issues: ['Canonical tag not set'],
  },
  {
    page: '/shop/plates',
    title: 'Plates',
    score: 44,
    metaTitle: 'Plates',
    metaTitleLen: 6,
    metaDesc: 'Buy stoneware plates online. Handmade by local potters.',
    metaDescLen: 55,
    h1: 'Plates',
    images: 10,
    imagesWithAlt: 10,
    internalLinks: 7,
    issues: ['Title tag too short (< 30 chars)'],
  },
  {
    page: '/shop/pots',
    title: 'Ceramic Plant Pots',
    score: 58,
    metaTitle: 'Ceramic Plant Pots — Handmade Pottery',
    metaTitleLen: 38,
    metaDesc: null,
    metaDescLen: 0,
    h1: 'Ceramic Plant Pots',
    images: 8,
    imagesWithAlt: 8,
    internalLinks: 5,
    issues: ['Meta description missing'],
  },
  {
    page: '/shop/gifts',
    title: 'Gift Collections',
    score: 72,
    metaTitle: 'Handmade Pottery Gifts | Unique Ceramic Gift Ideas',
    metaTitleLen: 50,
    metaDesc: 'Find the perfect handmade pottery gift. Mugs, bowls and sets for every occasion.',
    metaDescLen: 82,
    h1: 'Ceramic Gift Collections',
    images: 14,
    imagesWithAlt: 11,
    internalLinks: 9,
    issues: ['Images missing alt text (3 images)'],
  },
  {
    page: '/shop/dinnerware',
    title: 'Dinnerware Sets',
    score: 55,
    metaTitle: 'Artisan Handmade Ceramics — Shop Online',
    metaTitleLen: 40,
    metaDesc: 'Shop handmade ceramics and artisan pottery online. Free shipping on orders over $60.',
    metaDescLen: 86,
    h1: 'Dinnerware Sets',
    images: 12,
    imagesWithAlt: 12,
    internalLinks: 8,
    issues: ['Duplicate meta description with /shop'],
  },
  {
    page: '/about',
    title: 'Our Story',
    score: 49,
    metaTitle: 'Our Story | Handmade Ceramics Studio',
    metaTitleLen: 38,
    metaDesc: 'Learn about our ceramic studio and the artisans who make each piece by hand.',
    metaDescLen: 77,
    h1: null,
    images: 5,
    imagesWithAlt: 5,
    internalLinks: 3,
    issues: ['H1 tag missing'],
  },
]

const scoreColor = (s) => {
  if (s >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600', ring: 'ring-emerald-200' }
  if (s >= 60) return { bar: 'bg-amber-400', text: 'text-amber-600', ring: 'ring-amber-200' }
  return { bar: 'bg-red-400', text: 'text-red-600', ring: 'ring-red-200' }
}

function PageRow({ audit }) {
  const [open, setOpen] = useState(false)
  const sc = scoreColor(audit.score)

  return (
    <>
      <tr
        className="hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <td className="px-5 py-3">
          <p className="font-medium text-slate-800">{audit.title}</p>
          <p className="text-xs text-slate-400 font-mono">{audit.page}</p>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className={`w-9 h-9 rounded-full ring-2 ${sc.ring} flex items-center justify-center`}>
              <span className={`text-xs font-bold ${sc.text}`}>{audit.score}</span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {audit.metaDesc
              ? <CheckCircle size={13} className="text-emerald-500 shrink-0" />
              : <XCircle size={13} className="text-red-500 shrink-0" />}
            <span className="text-xs text-slate-500 truncate max-w-[160px]">
              {audit.metaDesc ? `${audit.metaDescLen} chars` : 'Missing'}
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
            <span className="text-xs text-slate-500 truncate max-w-[120px]">{audit.h1 || 'Missing'}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`text-xs ${audit.imagesWithAlt === audit.images ? 'text-emerald-600' : 'text-amber-600'}`}>
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
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Meta Title</p>
                <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs">
                  {audit.metaTitle}
                </p>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mt-2">Meta Description</p>
                <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs">
                  {audit.metaDesc || <span className="text-red-400 italic">Not set</span>}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Issues</p>
                {audit.issues.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm">
                    <CheckCircle size={14} />
                    No issues found — page looks great!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {audit.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs bg-red-50 border border-red-100 text-red-700 rounded-lg px-3 py-2">
                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                        {issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function OnPageSEO() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const errors = seoIssues.filter(i => i.type === 'error').length
  const warnings = seoIssues.filter(i => i.type === 'warning').length
  const infos = seoIssues.filter(i => i.type === 'info').length

  const filtered = seoIssues.filter(issue => {
    const matchType = filter === 'all' || issue.type === filter
    const matchSearch = issue.page.toLowerCase().includes(search.toLowerCase()) ||
      issue.issue.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <div>
      <Header title="On-Page SEO" subtitle="Audit your Wix site pages for SEO issues and opportunities" />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Critical Issues', count: errors, type: 'error', icon: XCircle, style: 'bg-red-50 border-red-100', textStyle: 'text-red-700', numStyle: 'text-red-600' },
          { label: 'Warnings', count: warnings, type: 'warning', icon: AlertTriangle, style: 'bg-amber-50 border-amber-100', textStyle: 'text-amber-700', numStyle: 'text-amber-600' },
          { label: 'Informational', count: infos, type: 'info', icon: Info, style: 'bg-blue-50 border-blue-100', textStyle: 'text-blue-700', numStyle: 'text-blue-600' },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => setFilter(filter === s.type ? 'all' : s.type)}
            className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${s.style} ${filter === s.type ? 'ring-2 ring-offset-1 ring-brand-300' : ''}`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-xs font-semibold uppercase tracking-wide ${s.textStyle}`}>{s.label}</p>
              <s.icon size={14} className={s.textStyle} />
            </div>
            <p className={`text-3xl font-bold mt-1 ${s.numStyle}`}>{s.count}</p>
            <p className={`text-xs mt-0.5 ${s.textStyle} opacity-70`}>Click to filter</p>
          </button>
        ))}
      </div>

      {/* Issues list */}
      <div className="bg-white rounded-xl border border-slate-200 mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">SEO Issues</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search issues..."
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200 w-52"
            />
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {filtered.map((issue, i) => {
            const cfg = typeConfig[issue.type]
            const Icon = cfg.icon
            return (
              <div key={i} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className={`mt-0.5 p-1.5 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                  <Icon size={14} className={cfg.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${impactColor[issue.impact]}`}>
                      {issue.impact} impact
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{issue.issue}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{issue.page}</p>
                </div>
                <button className="text-xs text-brand-600 font-medium hover:underline shrink-0 mt-1">
                  Fix →
                </button>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-400">
              <CheckCircle size={28} className="mx-auto mb-2 text-emerald-300" />
              <p className="text-sm">No issues match your filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Page-by-page audit */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Page Audit</h2>
          <p className="text-xs text-slate-400 mt-0.5">Click any row to see details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Page</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">SEO Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Meta Desc.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">H1</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Alt Text</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Issues</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageAudits.map((audit, i) => (
                <PageRow key={i} audit={audit} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
