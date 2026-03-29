import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  ShoppingCart, DollarSign, Package, TrendingUp, TrendingDown,
  Search, ChevronDown, ChevronUp, AlertCircle, Loader2,
  CheckCircle, Clock, XCircle
} from 'lucide-react'
import Header from '../components/Header'
import { useWixData } from '../hooks/useWixProducts'
import { stripHtml } from '../lib/wixApi'

function fmt(n) { return n?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function fmtShort(n) { return n >= 1000 ? `$${(n/1000).toFixed(1)}k` : `$${n.toFixed(0)}` }

function StatBox({ label, value, sub, highlight }) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
      <p className={`text-xs font-medium mb-1.5 ${highlight ? 'text-emerald-600' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${highlight ? 'text-emerald-500' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  )
}

function ProductCard({ product, inventory, orderData }) {
  const [expanded, setExpanded] = useState(false)
  const inv = inventory?.find(i => i.productId === product.id)
  const totalQty = inv?.variants?.reduce((s, v) => s + (v.quantity || 0), 0) ?? null
  const inStock = inv?.variants?.some(v => v.inStock) ?? true
  const imageUrl = product.media?.mainMedia?.image?.url
  const desc = stripHtml(product.description)
  const sales = orderData?.[product.name]

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
      <div className="flex gap-4 p-4">
        {imageUrl ? (
          <img
            src={`${imageUrl}/v1/fit/w_80,h_80,q_90/file.webp`}
            alt={product.name}
            className="w-14 h-14 rounded-lg object-cover shrink-0 bg-slate-100"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center">
            <Package size={18} className="text-slate-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{product.name}</p>
            <span className="text-sm font-bold text-slate-900 shrink-0">{product.price?.formatted?.price}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
              {inStock ? 'In stock' : 'Out of stock'}
            </span>
            {totalQty !== null && inv?.trackQuantity && (
              <span className="text-xs text-slate-400">{totalQty} units tracked</span>
            )}
            {sales && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                ${fmt(sales.revenue)} revenue
              </span>
            )}
            {product.variants?.length > 1 && (
              <span className="text-xs text-slate-400">{product.variants.length} variants</span>
            )}
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="text-slate-400 hover:text-slate-600 shrink-0 mt-1">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 space-y-2">
          {sales && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { label: 'Revenue', value: `$${fmt(sales.revenue)}` },
                { label: 'Units Sold', value: sales.units },
                { label: 'Orders', value: sales.orders },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-100 px-2.5 py-2 text-center">
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p className="text-sm font-bold text-slate-800">{s.value}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
            {desc || <span className="text-slate-400 italic">No description</span>}
          </p>
          {product.variants?.length > 1 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {product.variants.slice(0, 6).map((v, i) => (
                <span key={i} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                  {Object.values(v.choices || {}).join(' / ')} — {v.priceData?.formatted?.price}
                </span>
              ))}
              {product.variants.length > 6 && <span className="text-xs text-slate-400">+{product.variants.length - 6} more</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Ecommerce() {
  const { products, collections, inventory, orderStats, loading, error } = useWixData()
  const [search, setSearch] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('all')
  const [sortBy, setSortBy] = useState('revenue')

  // Build a quick lookup: product name → sales data
  const salesByName = useMemo(() => {
    if (!orderStats) return {}
    return Object.fromEntries(orderStats.topProducts.map(p => [p.name, p]))
  }, [orderStats])

  const filtered = useMemo(() => {
    if (!products) return []
    let list = products
    if (selectedCollection !== 'all') list = list.filter(p => p.collectionIds?.includes(selectedCollection))
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q))
    }
    if (sortBy === 'revenue') {
      list = [...list].sort((a, b) => (salesByName[b.name]?.revenue || 0) - (salesByName[a.name]?.revenue || 0))
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'price_asc') {
      list = [...list].sort((a, b) => (a.price?.price || 0) - (b.price?.price || 0))
    } else if (sortBy === 'price_desc') {
      list = [...list].sort((a, b) => (b.price?.price || 0) - (a.price?.price || 0))
    }
    return list
  }, [products, search, selectedCollection, sortBy, salesByName])

  const outOfStockCount = useMemo(() => {
    if (!inventory) return null
    return inventory.filter(i => i.variants.every(v => !v.inStock)).length
  }, [inventory])

  const fulfillPct = orderStats
    ? Math.round((orderStats.fulfillment.FULFILLED / (orderStats.totalOrders + orderStats.fulfillment.CANCELED)) * 100)
    : null

  return (
    <div>
      <Header
        title="E-commerce"
        subtitle="Live orders, revenue and product data from your Wix store"
        badge={orderStats ? `$${fmt(orderStats.totalRevenue)} total revenue` : null}
      />

      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading orders and products from Wix...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-6">
          <AlertCircle size={16} /> Failed to load: {error}
        </div>
      )}

      {!loading && !error && orderStats && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatBox label="Total Revenue" value={`$${fmt(orderStats.totalRevenue)}`} sub="all time, all paid orders" highlight />
            <StatBox label="Total Orders" value={orderStats.totalOrders.toLocaleString()} sub={`${orderStats.latestMonthLabel}: ${orderStats.latestMonthOrders} orders`} />
            <StatBox label="Avg. Order Value" value={`$${fmt(orderStats.avgOrderValue)}`} sub="across all paid orders" />
            <div className={`rounded-xl border p-5 ${outOfStockCount ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200'}`}>
              <p className={`text-xs font-medium mb-1.5 ${outOfStockCount ? 'text-red-500' : 'text-slate-500'}`}>Out of Stock</p>
              <p className={`text-2xl font-bold ${outOfStockCount ? 'text-red-600' : 'text-slate-900'}`}>{outOfStockCount ?? '—'}</p>
              <p className={`text-xs mt-1 ${outOfStockCount ? 'text-red-400' : 'text-slate-400'}`}>{products?.length} total products</p>
            </div>
          </div>

          {/* Revenue chart + Fulfillment */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-1">Monthly Revenue & Orders</h2>
              <p className="text-xs text-slate-400 mb-4">Last {orderStats.last6Months.length} months — live from Wix</p>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={orderStats.last6Months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    formatter={(v, name) => name === 'Revenue' ? `$${fmt(v)}` : v}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#4361ee" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#06d6a0" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Order Fulfillment</h2>
              <div className="space-y-3">
                {[
                  { label: 'Fulfilled', count: orderStats.fulfillment.FULFILLED, color: 'bg-emerald-500', text: 'text-emerald-700', icon: CheckCircle },
                  { label: 'Pending', count: orderStats.fulfillment.NOT_FULFILLED, color: 'bg-amber-400', text: 'text-amber-700', icon: Clock },
                  { label: 'Canceled', count: orderStats.fulfillment.CANCELED || 0, color: 'bg-slate-300', text: 'text-slate-500', icon: XCircle },
                ].map((s, i) => {
                  const total = orderStats.totalOrders + (orderStats.fulfillment.CANCELED || 0)
                  const pct = Math.round((s.count / total) * 100)
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <s.icon size={13} className={s.text} />
                          <span className="text-xs font-medium text-slate-700">{s.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{s.count}</span>
                          <span className={`text-xs font-bold ${s.text}`}>{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">Latest month revenue</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">${fmt(orderStats.latestMonthRevenue)}</p>
                <p className="text-xs text-slate-400">{orderStats.latestMonthLabel}</p>
              </div>
            </div>
          </div>

          {/* Top products by revenue */}
          <div className="bg-white rounded-xl border border-slate-200 mb-6">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Top Products by Revenue</h2>
              <span className="text-xs text-slate-400">All time · live Wix orders</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">#</th>
                    <th className="text-left px-2 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Units</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Orders</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rev / Unit</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orderStats.topProducts.map((p, i) => {
                    const share = (p.revenue / orderStats.totalRevenue) * 100
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-slate-400 text-xs font-medium">{i + 1}</td>
                        <td className="px-2 py-3 font-medium text-slate-800 max-w-[260px]">
                          <p className="truncate">{p.name}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">${fmt(p.revenue)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{p.units}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{p.orders}</td>
                        <td className="px-4 py-3 text-right text-slate-500">${fmt(p.revenue / p.units)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${share}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-8 text-right">{share.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Product catalog */}
      {!loading && !error && products && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Product Catalog</h2>
            <span className="text-xs text-slate-400">({products.length} products)</span>
          </div>

          {/* Collection filter */}
          {collections && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button onClick={() => setSelectedCollection('all')} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${selectedCollection === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                All ({products.length})
              </button>
              {collections.map(c => (
                <button key={c.id} onClick={() => setSelectedCollection(selectedCollection === c.id ? 'all' : c.id)} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${selectedCollection === c.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none">
              <option value="revenue">Sort: Revenue ↓</option>
              <option value="name">Sort: A–Z</option>
              <option value="price_desc">Sort: Price ↓</option>
              <option value="price_asc">Sort: Price ↑</option>
            </select>
            <span className="text-xs text-slate-400">{filtered.length} shown</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} inventory={inventory} orderData={salesByName} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
