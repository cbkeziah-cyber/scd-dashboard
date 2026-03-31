import express from 'express'
import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const WIX_BASE = 'https://www.wixapis.com'

app.use(express.json())

// Proxy all /wix-api/* requests to Wix, server-side (bypasses browser CORS)
app.use('/wix-api', async (req, res) => {
  const path = req.path
  const url = `${WIX_BASE}${path}`

  try {
    const headers = { 'Content-Type': 'application/json' }
    if (req.headers['authorization']) headers['Authorization'] = req.headers['authorization']
    if (req.headers['x-wix-site-id']) headers['wix-site-id'] = req.headers['x-wix-site-id']
    if (req.headers['wix-site-id']) headers['wix-site-id'] = req.headers['wix-site-id']

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Serve static build
app.use(express.static(join(__dirname, 'dist')))
app.use((_, res) => res.sendFile(join(__dirname, 'dist', 'index.html')))

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))
