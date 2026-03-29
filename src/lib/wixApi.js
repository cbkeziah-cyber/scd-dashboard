const CLIENT_ID = '88866539-be75-439d-a18f-874101a91f5a'
const BASE_URL = 'https://www.wixapis.com'

let _tokenCache = null

async function getToken() {
  if (_tokenCache && _tokenCache.expiresAt > Date.now()) {
    return _tokenCache.token
  }
  const res = await fetch(`${BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: CLIENT_ID, grantType: 'anonymous' }),
  })
  const data = await res.json()
  _tokenCache = {
    token: data.access_token,
    // expires_in is in seconds, subtract 60s buffer
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return _tokenCache.token
}

async function wixPost(path, body = {}) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function wixGet(path) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: token },
  })
  return res.json()
}

// --- Products ---
export async function fetchAllProducts() {
  const data = await wixPost('/stores/v1/products/query', {
    query: { paging: { limit: 100 } },
    includeVariants: true,
  })
  return data.products || []
}

// --- Collections ---
export async function fetchCollections() {
  const data = await wixPost('/stores/v1/collections/query', { query: {} })
  return (data.collections || []).filter(c => c.visible && c.id !== '00000000-000000-000000-000000000001')
}

// --- Inventory ---
export async function fetchInventory() {
  const data = await wixPost('/stores/v2/inventoryItems/query', {
    query: { paging: { limit: 100 } },
  })
  return data.inventoryItems || []
}

// --- Helpers ---

/** Strip HTML tags from a string */
export function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
}

/** Run an SEO audit on a product and return a structured result */
export function auditProduct(product) {
  const name = product.name || ''
  const slug = product.slug || ''
  const descRaw = product.description || ''
  const desc = stripHtml(descRaw)
  const media = product.media?.items || []
  const mainMedia = product.media?.mainMedia
  const allImages = mainMedia ? [mainMedia, ...media.filter(m => m !== mainMedia)] : media
  const imagesWithAlt = allImages.filter(m => m?.title && m.title.trim().length > 0).length

  const issues = []

  if (name.length < 30) issues.push({ type: 'error', issue: `Product name too short for SEO title (${name.length} chars, min 30)`, impact: 'High' })
  if (!desc) issues.push({ type: 'error', issue: 'No product description set', impact: 'High' })
  else if (desc.length < 100) issues.push({ type: 'warning', issue: `Description too short (${desc.length} chars, aim for 150+)`, impact: 'Medium' })
  if (imagesWithAlt < allImages.length) issues.push({ type: 'info', issue: `${allImages.length - imagesWithAlt} image(s) missing alt text`, impact: 'Medium' })
  if (slug.length > 60) issues.push({ type: 'info', issue: `URL slug is long (${slug.length} chars)`, impact: 'Low' })
  if (!product.visible) issues.push({ type: 'warning', issue: 'Product is hidden from storefront', impact: 'Medium' })

  // Score: start at 100, deduct per issue
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
