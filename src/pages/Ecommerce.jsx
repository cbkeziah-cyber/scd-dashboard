import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { ShoppingCart, DollarSign, Package, TrendingUp, TrendingDown, Users } from 'lucide-react'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import {
  overviewStats, ecommerceMetrics, topProducts, revenueOverTime
} from '../data/mockData'

export default function Ecommerce() {
  return (
    <div>
      <Header title="E-commerce" subtitle="Revenue, orders and product performance from Wix Analytics" />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue (Jan)" value={overviewStats.revenue.value} change={overviewStats.revenue.change} unit="$" icon={DollarSign} color="green" />
        <StatCard label="Conversions" value={overviewStats.conversions.value} change={overviewStats.conversions.change} icon={ShoppingCart} color="blue" />
        <StatCard label="Conv. Rate" value={ecommerceMetrics.conversionRate.value} change={ecommerceMetrics.conversionRate.change} unit="%" icon={TrendingUp} color="purple" />
        <StatCard label="Avg. Order Value" value={ecommerceMetrics.avgOrderValue.value} change={ecommerceMetrics.avgOrderValue.change} unit="$" icon={Package} color="orange" />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Cart abandonment + Returning customers */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Store Health Metrics</h2>
          <div className="space-y-4">
            {[
              {
                label: 'Cart Abandonment Rate',
                value: ecommerceMetrics.cartAbandonmentRate.value,
                change: ecommerceMetrics.cartAbandonmentRate.change,
                unit: '%',
                lowerIsBetter: true,
                color: '#f72585',
                note: 'Lower is better',
              },
              {
                label: 'Returning Customers',
                value: ecommerceMetrics.returningCustomers.value,
                change: ecommerceMetrics.returningCustomers.change,
                unit: '%',
                lowerIsBetter: false,
                color: '#4361ee',
                note: 'Higher is better',
              },
            ].map((m, i) => {
              const isGood = m.lowerIsBetter ? m.change < 0 : m.change > 0
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{m.label}</p>
                      <p className="text-xs text-slate-400">{m.note}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900">{m.value}{m.unit}</p>
                      <p className={`text-xs font-medium flex items-center justify-end gap-0.5 ${isGood ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isGood ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {Math.abs(m.change)}pp vs last period
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: m.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Revenue over time line */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Monthly Revenue & Orders</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(v, name) => name === 'Revenue' ? `$${v.toLocaleString()}` : v} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#4361ee" strokeWidth={2.5} dot={{ r: 4, fill: '#4361ee' }} />
              <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#06d6a0" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AOV Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Avg. Order Value by Month</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={revenueOverTime} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v) => `$${v}`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Bar dataKey="aov" name="Avg. Order Value" fill="#7209b7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Top Products</h2>
          <span className="text-xs text-slate-400">Jan 1 – Jan 14, 2026</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Orders</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Views</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Conv. Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rev / View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topProducts.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{p.orders}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">${p.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{p.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      p.convRate >= 3 ? 'bg-emerald-50 text-emerald-700' :
                      p.convRate >= 2 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.convRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    ${(p.revenue / p.views).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
