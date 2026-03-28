import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  Globe,
  ShoppingCart,
  Search,
  Settings,
  BarChart3,
  Zap,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/traffic', icon: TrendingUp, label: 'Traffic' },
  { to: '/keywords', icon: Search, label: 'Keywords' },
  { to: '/ecommerce', icon: ShoppingCart, label: 'E-commerce' },
  { to: '/on-page', icon: Globe, label: 'On-Page SEO' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <BarChart3 size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-700 text-slate-900 font-bold leading-tight">SEO Tracker</p>
          <p className="text-xs text-slate-400 leading-tight">Wix Analytics</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="bg-brand-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-brand-600" />
            <span className="text-xs font-semibold text-brand-700">Wix Connected</span>
          </div>
          <p className="text-xs text-brand-500">Live data syncing every 24h</p>
        </div>
      </div>
    </aside>
  )
}
