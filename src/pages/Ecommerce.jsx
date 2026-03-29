import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  ShoppingCart, DollarSign, Package, TrendingUp, TrendingDown,
  Search, Tag, ChevronDown, ChevronUp, AlertCircle, Loader2
} from 'lucide-react'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import { ecommerceMetrics, revenueOverTime } from '../data/mockData'
import { useWixData } from '../hooks/useWixProducts'
import { stripHtml } from '../lib/wixApi'

const CATEGORY_COLORS = {
  CBD: '#4361ee', Delta8: '#7209b7', Delta9: '#f72585', Beverages: '#4cc9f0',
  Gummies: '#06d6a0', Tinctures: '#fb8500', Topical: '#e63946', Apparel: '#457b9d',
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">Loading live data from Wix...</span>
    </div>
  )
}

function ProductCard({ product, inventory }) {
  const [expanded, setExpanded] = useState(false)
  const inv = inventory?.find(i => i.productId === product.id)
  const totalQty = inv?.variants?.reduce((s, v) => s + (v.quantity || 0), 0) ?? null
  const inStock = inv?.variants?.some(v => v.inStock) ?? true
  const imageUrl = product.media?.mainMedia?.image?.url
  const desc = stripHtml(product.description)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
      <div className="flex gap-4 p-4">
        {imageUrl ? (
          <img
            src={`${imageUrl}/v1/fit/w_80,h_80,q_90/file.webp`}
            alt={product.name}
            className="w-16 h-16 rounded-lg object-cover shrink-0 bg-slate-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center">
            <Package size={20} className="text-slate-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{product.name}</p>
            <span className="text-sm font-bold text-slate-900 shrink-0">{product.price?.formatted?.price}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs font-mono text-slate-400">{product.slug}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
              {inStock ? 'In stock' : 'Out of stock'}
            </span>
            {totalQty !== null && inv?.trackQuantity && (
              <span className="text-xs text-slate-400">{totalQty} units</span>
            )}
            {product.variants?.length > 1 && (
              <span className="text-xs text-blue-500">{product.variants.length} variants</span>
            )}
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="text-slate-400 hover:text-slate-600 shrink-0 mt-0.5">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
            {desc || <span className="text-slate-400 italic">No description</span>}
          </p>
          {product.variants?.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.variants.slice(0, 8).map((v, i) => (
                <span key={i} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                  {Object.values(v.choices || {}).join(' / ')}
                  {' — '}
                  {v.priceData?.formatted?.price}
                </span>
              ))}
              {product.variants.length > 8 && (
                <span className="text-xs text-slate-400">+{product.variants.length - 8} more</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Ecommerce() {
  const { products, collections, inventory, loading, error } = useWixData()
  const [search, setSearch] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const filtered = useMemo(() => {
    if (!products) return []
    let list = products

    if (selectedCollection !== 'all') {
      list = list.filter(p => p.collectionIds?.includes(selectedCollection))
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q)
      )
    }
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'price_asc') list = [...list].sort((a, b) => (a.price?.price || 0) - (b.price?.price || 0))
    if (sortBy === 'price_desc') list = [...list].sort((a, b) => (b.price?.price || 0) - (a.price?.price || 0))

    return list
  }, [products, search, selectedCollection, sortBy])

  const totalInventoryUnits = useMemo(() => {
    if (!inventory) return null
    return inventory
      .filter(i => i.trackQuantity)
      .reduce((s, i) => s + i.variants.reduce((vs, v) => vs + (v.quantity || 0), 0), 0)
  }, [inventory])

  const outOfStockCount = useMemo(() => {
    if (!inventory) return null
    return inventory.filter(i => i.variants.every(v => !v.inStock)).length
  }, [inventory])

  const avgPrice = useMemo(() => {
    if (!products?.length) return null
    const sum = products.reduce((s, p) => s + (p.price?.price || 0), 0)
    return (sum / products.length).toFixed(2)
  }, [products])

  return (
    <div>
      <Header
        title="E-commerce"
        subtitle="Live product catalog and inventory from your Wix store"
        badge={products ? `${products.length} products` : null}
      />

      {/* KPI row — mix of live + analytics mock */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 font-medium mb-2">Live Products</p>
          <p className="text-2xl font-bold text-slate-900">{products ? products.length : '—'}</p>
          <p className="text-xs text-slate-400 mt-1">across {collections?.length ?? '—'} collections</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 font-medium mb-2">Avg. Product Price</p>
          <p className="text-2xl font-bold text-slate-900">{avgPrice ? `$${avgPrice}` : '—'}</p>
          <p className="text-xs text-slate-400 mt-1">across all variants</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 font-medium mb-2">Tracked Inventory</p>
          <p className="text-2xl font-bold text-slate-900">{totalInventoryUnits !== null ? totalInventoryUnits : '—'}</p>
          <p className="text-xs text-slate-400 mt-1">units in stock</p>
        </div>
        <div className={`rounded-xl border p-5 ${outOfStockCount ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-medium mb-2 ${outOfStockCount ? 'text-red-500' : 'text-slate-500'}`}>Out of Stock</p>
          <p className={`text-2xl font-bold ${outOfStockCount ? 'text-red-600' : 'text-slate-900'}`}>{outOfStockCount !== null ? outOfStockCount : '—'}</p>
          <p className={`text-xs mt-1 ${outOfStockCount ? 'text-red-400' : 'text-slate-400'}`}>products need restocking</p>
        </div>
      </div>

      {/* Revenue charts — analytics mock (orders API requires owner auth) */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Revenue Over Time</h2>
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Sample data — connect owner API key for live</span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4361ee" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Conv. Rate & Cart Abandonment</h2>
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Sample data</span>
          </div>
          <div className="space-y-4 mt-4">
            {[
              { label: 'Conversion Rate', value: ecommerceMetrics.conversionRate.value, unit: '%', color: '#4361ee', note: 'of sessions → purchase' },
              { label: 'Cart Abandonment', value: ecommerceMetrics.cartAbandonmentRate.value, unit: '%', color: '#f72585', note: 'leave before checkout' },
              { label: 'Returning Customers', value: ecommerceMetrics.returningCustomers.value, unit: '%', color: '#06d6a0', note: 'of total buyers' },
            ].map((m, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-medium text-slate-600">{m.label}</p>
                  <p className="text-sm font-bold text-slate-800">{m.value}{m.unit}</p>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: m.color }} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collections filter */}
      {collections && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCollection('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              selectedCollection === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All ({products?.length})
          </button>
          {collections.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCollection(selectedCollection === c.id ? 'all' : c.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                selectedCollection === c.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Search + sort */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
        >
          <option value="name">Sort: A–Z</option>
          <option value="price_asc">Sort: Price ↑</option>
          <option value="price_desc">Sort: Price ↓</option>
        </select>
        {products && (
          <span className="text-xs text-slate-400">{filtered.length} of {products.length} products</span>
        )}
      </div>

      {/* Product grid */}
      {loading && <LoadingSpinner />}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} />
          Failed to load Wix data: {error}
        </div>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} inventory={inventory} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 py-12 text-center text-slate-400 text-sm">
              No products match your search.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
