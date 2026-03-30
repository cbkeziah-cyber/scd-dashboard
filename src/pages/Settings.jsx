import { useState } from 'react'
import {
  Globe, Bell, Zap, Shield, RefreshCw, Check,
  ExternalLink, Link2, Link2Off, ChevronDown,
} from 'lucide-react'
import Header from '../components/Header'
import { useGoogleData } from '../hooks/useGoogleData'

const WixLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" className="shrink-0">
    <rect width="48" height="48" rx="8" fill="#0C6EFC" />
    <text x="6" y="34" fontFamily="Arial" fontWeight="bold" fontSize="20" fill="white">Wix</text>
  </svg>
)

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" className="shrink-0">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-[22px] rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-slate-200'}`}
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
  const {
    isConnected, hasGA4, connect, disconnect,
    ga4Properties, ga4PropertyId, selectGA4Property,
    loading, error,
  } = useGoogleData()

  const [notifications, setNotifications] = useState({
    rankingDrops: true, weeklyReport: true, newIssues: true,
    trafficAlerts: false, revenueAlerts: false,
  })
  const [syncFreq, setSyncFreq] = useState('24h')
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div>
      <Header title="Settings" subtitle="Manage your connections, notifications and preferences" />

      <Section title="Wix Store Connection">
        <div className="px-5 py-5">
          <div className="flex items-center gap-3 mb-4">
            <WixLogo />
            <div>
              <p className="text-sm font-semibold text-slate-800">Connected to Wix Store</p>
              <p className="text-xs text-slate-400">scdisp.com · Live product and order data</p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Sync Frequency</p>
              <div className="flex gap-2">
                {['6h', '12h', '24h', '48h'].map((f) => (
                  <button key={f} onClick={() => setSyncFreq(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${syncFreq === f ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                    Every {f}
                  </button>
                ))}
              </div>
            </div>
            <button className="ml-auto flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <RefreshCw size={14} /> Sync Now
            </button>
          </div>
        </div>
      </Section>

      <Section title="Google Search Console & Analytics">
        <div className="px-5 py-5">
          {error && (
            <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
          )}
          {!isConnected ? (
            <div className="flex items-center gap-4">
              <GoogleLogo />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Connect Google Account</p>
                <p className="text-xs text-slate-400 mt-0.5">Pull real keyword rankings, CTR and traffic from Search Console and Analytics</p>
              </div>
              <button onClick={connect} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
                <Link2 size={14} />
                {loading ? 'Connecting...' : 'Connect Google'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <GoogleLogo />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Google Account Connected</p>
                  <p className="text-xs text-slate-400">Search Console: scdisp.com · Last 28 days</p>
                </div>
                <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live
                </span>
              </div>
              {ga4Properties && ga4Properties.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-600 mb-1.5">GA4 Property</p>
                  <div className="relative w-80">
                    <select value={ga4PropertyId || ''} onChange={(e) => selectGA4Property(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none pr-8">
                      <option value="">Select a GA4 property…</option>
                      {ga4Properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.account})</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {hasGA4 && <p className="text-xs text-emerald-600 mt-1">✓ GA4 connected — property {ga4PropertyId}</p>}
                </div>
              )}
              <button onClick={disconnect} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition">
                <Link2Off size={13} /> Disconnect Google
              </button>
            </div>
          )}
        </div>
      </Section>

      <Section title="Notifications">
        {[
          { key: 'rankingDrops', icon: Globe, iconBg: 'bg-red-50 text-red-500', label: 'Ranking drops', desc: 'Alert when a keyword drops more than 5 positions' },
          { key: 'weeklyReport', icon: Bell, iconBg: 'bg-blue-50 text-blue-500', label: 'Weekly SEO report', desc: 'Email summary every Monday' },
          { key: 'newIssues', icon: Shield, iconBg: 'bg-amber-50 text-amber-500', label: 'New SEO issues', desc: 'Alert when critical issues are detected' },
          { key: 'trafficAlerts', icon: Zap, iconBg: 'bg-purple-50 text-purple-500', label: 'Traffic anomalies', desc: 'Notify on significant traffic drops or spikes' },
          { key: 'revenueAlerts', icon: Zap, iconBg: 'bg-emerald-50 text-emerald-500', label: 'Revenue alerts', desc: 'Notify when daily revenue deviates by 20%+' },
        ].map(({ key, icon, iconBg, label, desc }) => (
          <Row key={key} icon={icon} iconBg={iconBg} label={label} desc={desc}
            right={<Toggle checked={notifications[key]} onChange={(v) => setNotifications((p) => ({ ...p, [key]: v }))} />}
          />
        ))}
      </Section>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-brand-500 text-white hover:bg-brand-600'}`}>
          {saved ? <Check size={15} /> : null}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
