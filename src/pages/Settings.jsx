import { useState } from 'react'
import {
  Globe, Bell, Zap, Shield, RefreshCw, Check,
  ChevronRight, ToggleLeft, ToggleRight, ExternalLink
} from 'lucide-react'
import Header from '../components/Header'

const WixLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" className="shrink-0">
    <rect width="48" height="48" rx="8" fill="#0C6EFC" />
    <text x="6" y="34" fontFamily="Arial" fontWeight="bold" fontSize="20" fill="white">Wix</text>
  </svg>
)

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 h-[22px] rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-[18px]' : ''}`} />
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  )
}

function Row({ icon: Icon, iconBg, label, desc, right }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  )
}

export default function Settings() {
  const [notifications, setNotifications] = useState({
    rankingDrops: true,
    weeklyReport: true,
    newIssues: true,
    trafficAlerts: false,
    revenueAlerts: false,
  })
  const [syncFreq, setSyncFreq] = useState('24h')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <Header title="Settings" subtitle="Manage your Wix connection, notifications and preferences" />

      {/* Wix Connection */}
      <Section title="Wix Analytics Connection">
        <div className="px-5 py-5">
          <div className="flex items-center gap-3 mb-4">
            <WixLogo />
            <div>
              <p className="text-sm font-semibold text-slate-800">Connected to Wix Analytics</p>
              <p className="text-xs text-slate-400">Site: ceramicstudio.wixsite.com/shop · Connected Jan 3, 2026</p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Last Sync', value: 'Today, 6:00 AM' },
              { label: 'Next Sync', value: 'Tomorrow, 6:00 AM' },
              { label: 'Data Range', value: 'Last 90 days' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Sync Frequency</p>
              <div className="flex gap-2">
                {['6h', '12h', '24h', '48h'].map(f => (
                  <button
                    key={f}
                    onClick={() => setSyncFreq(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      syncFreq === f
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Every {f}
                  </button>
                ))}
              </div>
            </div>
            <button className="ml-auto flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <RefreshCw size={14} />
              Sync Now
            </button>
            <a href="#" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-100 rounded-lg hover:bg-brand-100 transition">
              <ExternalLink size={14} />
              Open Wix Dashboard
            </a>
          </div>
        </div>
      </Section>

      {/* Notification Preferences */}
      <Section title="Notifications">
        {[
          { key: 'rankingDrops', icon: Globe, iconBg: 'bg-red-50 text-red-500', label: 'Ranking drops', desc: 'Alert when a keyword drops more than 5 positions' },
          { key: 'weeklyReport', icon: Bell, iconBg: 'bg-blue-50 text-blue-500', label: 'Weekly SEO report', desc: 'Email summary of your SEO performance every Monday' },
          { key: 'newIssues', icon: Shield, iconBg: 'bg-amber-50 text-amber-500', label: 'New SEO issues', desc: 'Alert when critical issues are detected on your pages' },
          { key: 'trafficAlerts', icon: Zap, iconBg: 'bg-purple-50 text-purple-500', label: 'Traffic anomalies', desc: 'Notify when traffic drops or spikes significantly' },
          { key: 'revenueAlerts', icon: Zap, iconBg: 'bg-emerald-50 text-emerald-500', label: 'Revenue alerts', desc: 'Notify when daily revenue deviates by ≥20%' },
        ].map(({ key, icon, iconBg, label, desc }) => (
          <Row
            key={key}
            icon={icon}
            iconBg={iconBg}
            label={label}
            desc={desc}
            right={
              <Toggle
                checked={notifications[key]}
                onChange={(v) => setNotifications(prev => ({ ...prev, [key]: v }))}
              />
            }
          />
        ))}
      </Section>

      {/* Tracked Keywords */}
      <Section title="Keyword Tracking">
        <div className="px-5 py-4">
          <p className="text-xs text-slate-500 mb-3">Keywords are automatically discovered from your Wix site's organic search data. You can add custom keywords to track.</p>
          <div className="flex gap-2">
            <input
              placeholder="Add a keyword to track..."
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <button className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {['handmade ceramic mugs', 'artisan pottery shop', 'ceramic bowl set', 'unique coffee mugs'].map((kw, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                {kw}
                <button className="text-slate-400 hover:text-slate-600 ml-1">×</button>
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* Competitor Tracking */}
      <Section title="Competitor Tracking">
        <div className="px-5 py-4">
          <p className="text-xs text-slate-500 mb-3">Add competitor domains to benchmark your SEO performance.</p>
          <div className="flex gap-2 mb-3">
            <input
              placeholder="competitor-domain.com"
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <button className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition">
              Add
            </button>
          </div>
          <div className="space-y-2">
            {['claypottery.com', 'mudandfire.co'].map((domain, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-slate-300 flex items-center justify-center text-xs text-white font-bold">{domain[0].toUpperCase()}</div>
                  <span className="text-sm text-slate-700 font-medium">{domain}</span>
                </div>
                <button className="text-xs text-red-500 hover:text-red-600">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-brand-500 text-white hover:bg-brand-600'
          }`}
        >
          {saved ? <Check size={15} /> : null}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
