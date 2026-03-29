const CLIENT_ID = '88866539-be75-439d-a18f-874101a91f5a'
const API_KEY = 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg4MmE3NDcwLWViZTAtNGU3OC1hOGUyLWQ0ODA5OGRhNTdhM1wiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcImUzMDJjZmQ3LWRkYzEtNGQyYS1hNDBkLWNjY2JhNWIwOTU4Y1wifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJmMDQwNWQ1MS01M2EzLTQyN2MtYWQ2NS00MWUwNzJjYjBkOGVcIn19IiwiaWF0IjoxNzc0NzUwMDM5fQ.VRRop9g2Nycf57bezjrh4mJ2ox8WGXkfZo2a2Y2Tp9xWMDqOvqH3YCR4kHKXQ2AV5qJR93dcnRUxuKiFD4sWwBWQ8ahtr-P308Li1Hmlhy3kwZN-mAOviVpphnG9e5JhBHgQlcbjcMHmW0iZSg75eTb-zxdAZZ5mIyphVslrzWwKnZcUCuMkbtHoaG7CPzC5G7u-C9CaIGnhibtPBJPkDkHg96F4kNP45XyBU-6DwgHwWifQsW-B03d28RWkU0Rh6RhQTd8QPTGGCrSpRTia-2VkDLx8u90q6prHNY8caJo-nmWd5vCN0kNUQm3pcY67HJX7Ect21wZRW1HWNSFSTA'
const SITE_ID = 'e51318d7-c508-40d7-b866-40541c08157f'
const BASE_URL = 'https://www.wixapis.com'

let _tokenCache = null

async function getAnonToken() {
  if (_tokenCache && _tokenCache.expiresAt > Date.now()) return _tokenCache.token
  const res = await fetch(`${BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: CLIENT_ID, grantType: 'anonymous' }),
  })
  const data = await res.json()
  _tokenCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 }
  return _tokenCache.token
}

async function apiPost(path, body = {}, useApiKey = false) {
  const token = useApiKey ? API_KEY : await getAnonToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      ...(useApiKey ? { 'wix-site-id': SITE_ID } : {}),
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

// --- Products (anon) ---
export async function fetchAllProducts() {
  const data = await apiPost('/stores/v1/products/query', {
    query: { paging: { limit: 100 } },
    includeVariants: true,
  })
  return data.products || []
}

// --- Collections (anon) ---
export async function fetchCollections() {
  const data = await apiPost('/stores/v1/collections/query', { query: {} })
  return (data.collections || []).filter(c => c.visible && c.id !== '00000000-000000-000000-000000000001')
}

// --- Inventory (anon) ---
export async function fetchInventory() {
  const data = await apiPost('/stores/v2/inventoryItems/query', {
    query: { paging: { limit: 100 } },
  })
  return data.inventoryItems || []
}

// --- Orders (owner API key, paginated) ---
export async function fetchAllOrders() {
  const pages = await Promise.all([0, 100].map(offset =>
    apiPost('/stores/v2/orders/query', { query: { paging: { limit: 100, offset } } }, true)
  ))
  return pages.flatMap(p => p.orders || [])
}

// --- Derived order analytics ---
export function computeOrderStats(orders) {
  const paid = orders.filter(o => o.paymentStatus === 'PAID')
  const totalRevenue = paid.reduce((s, o) => s + parseFloat(o.totals.total), 0)
  const totalOrders = paid.length
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0

  // Revenue by month (last 12 months)
  const byMonth = {}
  paid.forEach(o => {
    const m = o.dateCreated.slice(0, 7)
    byMonth[m] = byMonth[m] || { revenue: 0, orders: 0 }
    byMonth[m].revenue += parseFloat(o.totals.total)
    byMonth[m].orders += 1
  })
  const monthLabels = Object.keys(byMonth).sort()
  const revenueByMonth = monthLabels.map(m => ({
    date: m.slice(0, 7),
    label: new Date(m + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
    revenue: Math.round(byMonth[m].revenue * 100) / 100,
    orders: byMonth[m].orders,
    aov: Math.round((byMonth[m].revenue / byMonth[m].orders) * 100) / 100,
  }))

  // Last 6 months
  const last6 = revenueByMonth.slice(-6)

  // Month-over-month change for latest month
  const latest = revenueByMonth[revenueByMonth.length - 1]
  const prev = revenueByMonth[revenueByMonth.length - 2]
  const revenueChange = prev?.revenue
    ? Math.round(((latest.revenue - prev.revenue) / prev.revenue) * 1000) / 10
    : null

  // Top products
  const prodSales = {}
  paid.forEach(o => {
    o.lineItems?.forEach(item => {
      const name = item.name
      prodSales[name] = prodSales[name] || { revenue: 0, orders: 0, units: 0, productId: item.productId, imageUrl: item.mediaItem?.url }
      prodSales[name].revenue += parseFloat(item.totalPrice || 0)
      prodSales[name].orders += 1
      prodSales[name].units += item.quantity || 0
    })
  })
  const topProducts = Object.entries(prodSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(([name, s]) => ({ name, ...s, revenue: Math.round(s.revenue * 100) / 100 }))

  // Fulfillment
  const fulfillment = { FULFILLED: 0, NOT_FULFILLED: 0, CANCELED: 0 }
  orders.forEach(o => { fulfillment[o.fulfillmentStatus] = (fulfillment[o.fulfillmentStatus] || 0) + 1 })

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    revenueChange,
    revenueByMonth,
    last6Months: last6,
    topProducts,
    fulfillment,
    latestMonthRevenue: latest?.revenue ?? 0,
    latestMonthOrders: latest?.orders ?? 0,
    latestMonthLabel: latest?.label ?? '',
  }
}

// --- Helpers ---
export function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
}

export function auditProduct(product) {
  const name = product.name || ''
  const desc = stripHtml(product.description)
  const media = product.media?.items || []
  const mainMedia = product.media?.mainMedia
  const allImages = mainMedia ? [mainMedia, ...media.filter(m => m !== mainMedia)] : media
  const imagesWithAlt = allImages.filter(m => m?.title && m.title.trim().length > 0).length
  const slug = product.slug || ''

  const issues = []
  if (name.length < 30) issues.push({ type: 'error', issue: `Product name too short (${name.length} chars, min 30)`, impact: 'High' })
  if (!desc) issues.push({ type: 'error', issue: 'No product description set', impact: 'High' })
  else if (desc.length < 100) issues.push({ type: 'warning', issue: `Description too short (${desc.length} chars, aim for 150+)`, impact: 'Medium' })
  if (imagesWithAlt < allImages.length) issues.push({ type: 'info', issue: `${allImages.length - imagesWithAlt} image(s) missing alt text`, impact: 'Medium' })
  if (slug.length > 60) issues.push({ type: 'info', issue: `URL slug is long (${slug.length} chars)`, impact: 'Low' })
  if (!product.visible) issues.push({ type: 'warning', issue: 'Product hidden from storefront', impact: 'Medium' })

  const deductions = { error: 20, warning: 10, info: 3 }
  const score = Math.max(0, 100 - issues.reduce((acc, i) => acc + deductions[i.type], 0))

  return {
    page: `/product-page/${slug}`,
    title: name,
    score,
    metaTitle: name,
    metaTitleLen: name.length,
    metaDesc: desc.slice(0, 200) || null,
    metaDescLen: Math.min(desc.length, 200),
    h1: name || null,
    images: allImages.length,
    imagesWithAlt,
    price: product.price?.formatted?.price || '',
    issues,
    productId: product.id,
    slug,
    visible: product.visible,
  }
}
