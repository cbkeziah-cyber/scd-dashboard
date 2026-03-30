const CLIENT_ID = '98358361478-gshsvg0mv979e0klmtrdpgsoadvi8vf3.apps.googleusercontent.com'
const GSC_SITE = 'https://www.scdisp.com'
const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
].join(' ')

// --- Token storage ---
export const getToken = () => localStorage.getItem('goog_token')
export const setToken = (t) => localStorage.setItem('goog_token', t)
export const clearToken = () => {
  localStorage.removeItem('goog_token')
  localStorage.removeItem('ga4_property_id')
}
export const getGA4PropertyId = () => localStorage.getItem('ga4_property_id')
export const setGA4PropertyId = (id) => localStorage.setItem('ga4_property_id', id)

// --- OAuth ---
export function requestGoogleAuth(onSuccess, onError) {
  if (!window.google?.accounts?.oauth2) {
    onError('Google Identity Services not loaded yet. Please try again.')
    return
  }
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) { onError(response.error); return }
      setToken(response.access_token)
      onSuccess(response.access_token)
    },
  })
  client.requestAccessToken()
}

// --- Generic fetch helper ---
async function gFetch(url, options = {}) {
  const token = getToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (res.status === 401) {
    clearToken()
    throw new Error('Google session expired. Please reconnect.')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }
  return res.json()
}

const fmt = (d) => d.toISOString().slice(0, 10)
const daysAgo = (n) => new Date(Date.now() - n * 86400000)

// --- GSC: keyword rankings (last 28 days) ---
export async function fetchGSCKeywords() {
  const siteEnc = encodeURIComponent(GSC_SITE)
  const data = await gFetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteEnc}/searchAnalytics/query`,
    {
      method: 'POST',
      body: JSON.stringify({
        startDate: fmt(daysAgo(28)),
        endDate: fmt(daysAgo(1)),
        dimensions: ['query'],
        rowLimit: 100,
        dataState: 'all',
      }),
    }
  )
  return (data.rows || []).map((r) => ({
    keyword: r.keys[0],
    clicks: Math.round(r.clicks),
    impressions: Math.round(r.impressions),
    ctr: Math.round(r.ctr * 1000) / 10,
    position: Math.round(r.position * 10) / 10,
  }))
}

// --- GSC: clicks/impressions/ctr/position over time (last 90 days) ---
export async function fetchGSCOverTime() {
  const siteEnc = encodeURIComponent(GSC_SITE)
  const data = await gFetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteEnc}/searchAnalytics/query`,
    {
      method: 'POST',
      body: JSON.stringify({
        startDate: fmt(daysAgo(90)),
        endDate: fmt(daysAgo(1)),
        dimensions: ['date'],
        rowLimit: 90,
      }),
    }
  )
  return (data.rows || []).map((r) => ({
    date: r.keys[0].slice(5), // MM-DD
    clicks: Math.round(r.clicks),
    impressions: Math.round(r.impressions),
    ctr: Math.round(r.ctr * 1000) / 10,
    position: Math.round(r.position * 10) / 10,
  }))
}

// --- GSC: top pages ---
export async function fetchGSCPages() {
  const siteEnc = encodeURIComponent(GSC_SITE)
  const data = await gFetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteEnc}/searchAnalytics/query`,
    {
      method: 'POST',
      body: JSON.stringify({
        startDate: fmt(daysAgo(28)),
        endDate: fmt(daysAgo(1)),
        dimensions: ['page'],
        rowLimit: 25,
      }),
    }
  )
  return (data.rows || []).map((r) => ({
    page: r.keys[0].replace(GSC_SITE, '') || '/',
    url: r.keys[0],
    clicks: Math.round(r.clicks),
    impressions: Math.round(r.impressions),
    ctr: Math.round(r.ctr * 1000) / 10,
    position: Math.round(r.position * 10) / 10,
  }))
}

// --- GA4: list available properties ---
export async function fetchGA4Properties() {
  const data = await gFetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries')
  const props = []
  for (const account of data.accountSummaries || []) {
    for (const prop of account.propertySummaries || []) {
      props.push({
        id: prop.property.replace('properties/', ''),
        name: prop.displayName,
        account: account.displayName,
      })
    }
  }
  return props
}

// --- GA4: daily sessions by channel (last 90 days) ---
export async function fetchGA4TrafficOverTime(propertyId) {
  const data = await gFetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      body: JSON.stringify({
        dateRanges: [{ startDate: fmt(daysAgo(90)), endDate: fmt(daysAgo(1)) }],
        dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGrouping' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
    }
  )
  // Pivot: date -> {organic, direct, social, referral}
  const byDate = {}
  for (const row of data.rows || []) {
    const date = row.dimensionValues[0].value
    const channel = row.dimensionValues[1].value.toLowerCase()
    const sessions = parseInt(row.metricValues[0].value)
    if (!byDate[date]) byDate[date] = { date: date.slice(4, 6) + '-' + date.slice(6, 8) }
    if (channel.includes('organic search')) byDate[date].organic = (byDate[date].organic || 0) + sessions
    else if (channel.includes('direct')) byDate[date].direct = (byDate[date].direct || 0) + sessions
    else if (channel.includes('social')) byDate[date].social = (byDate[date].social || 0) + sessions
    else if (channel.includes('referral')) byDate[date].referral = (byDate[date].referral || 0) + sessions
    else byDate[date].other = (byDate[date].other || 0) + sessions
  }
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
}

// --- GA4: channel breakdown (last 28 days) ---
export async function fetchGA4Channels(propertyId) {
  const data = await gFetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      body: JSON.stringify({
        dateRanges: [{ startDate: fmt(daysAgo(28)), endDate: fmt(daysAgo(1)) }],
        dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),
    }
  )
  const rows = data.rows || []
  const total = rows.reduce((s, r) => s + parseInt(r.metricValues[0].value), 0)
  return rows.map((r) => ({
    name: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value),
    value: Math.round((parseInt(r.metricValues[0].value) / total) * 100),
  }))
}

// --- GA4: device breakdown ---
export async function fetchGA4Devices(propertyId) {
  const data = await gFetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      body: JSON.stringify({
        dateRanges: [{ startDate: fmt(daysAgo(28)), endDate: fmt(daysAgo(1)) }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
    }
  )
  const rows = data.rows || []
  const total = rows.reduce((s, r) => s + parseInt(r.metricValues[0].value), 0)
  return rows.map((r) => ({
    name: r.dimensionValues[0].value.charAt(0).toUpperCase() + r.dimensionValues[0].value.slice(1),
    sessions: parseInt(r.metricValues[0].value),
    pct: Math.round((parseInt(r.metricValues[0].value) / total) * 100),
  }))
}

// --- GA4: summary stats (current vs previous 28 days) ---
export async function fetchGA4Stats(propertyId) {
  const [curr, prev] = await Promise.all([
    gFetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        body: JSON.stringify({
          dateRanges: [{ startDate: fmt(daysAgo(28)), endDate: fmt(daysAgo(1)) }],
          metrics: [
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'newUsers' },
          ],
        }),
      }
    ),
    gFetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        body: JSON.stringify({
          dateRanges: [{ startDate: fmt(daysAgo(56)), endDate: fmt(daysAgo(29)) }],
          metrics: [
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'newUsers' },
          ],
        }),
      }
    ),
  ])

  const cv = curr.totals?.[0]?.metricValues || curr.rows?.[0]?.metricValues || []
  const pv = prev.totals?.[0]?.metricValues || prev.rows?.[0]?.metricValues || []

  const pct = (ci, pi) => {
    const c = parseFloat(cv[ci]?.value || 0)
    const p = parseFloat(pv[pi]?.value || 0)
    if (!p) return null
    return Math.round(((c - p) / p) * 100)
  }

  return {
    sessions: { value: parseInt(cv[0]?.value || 0), change: pct(0, 0) },
    pageViews: { value: parseInt(cv[1]?.value || 0), change: pct(1, 1) },
    bounceRate: { value: Math.round(parseFloat(cv[2]?.value || 0) * 100), change: pct(2, 2) },
    newUsers: { value: parseInt(cv[3]?.value || 0), change: pct(3, 3) },
  }
}

// --- GA4: top pages by sessions ---
export async function fetchGA4Pages(propertyId) {
  const data = await gFetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      body: JSON.stringify({
        dateRanges: [{ startDate: fmt(daysAgo(28)), endDate: fmt(daysAgo(1)) }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 25,
      }),
    }
  )
  return (data.rows || []).map((r) => ({
    page: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value),
    pageViews: parseInt(r.metricValues[1].value),
  }))
}
