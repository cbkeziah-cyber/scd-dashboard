import { useState, useEffect, useCallback } from 'react'
import {
  getToken, setToken, clearToken,
  getGA4PropertyId, setGA4PropertyId as storeGA4PropertyId,
  requestGoogleAuth,
  fetchGSCKeywords, fetchGSCOverTime, fetchGSCPages,
  fetchGA4Properties, fetchGA4TrafficOverTime,
  fetchGA4Channels, fetchGA4Devices, fetchGA4Stats, fetchGA4Pages,
} from '../lib/googleApi'

// Module-level cache so data survives page navigation
const cache = {
  gscKeywords: null, gscOverTime: null, gscPages: null,
  ga4Properties: null, ga4TrafficOverTime: null,
  ga4Channels: null, ga4Devices: null, ga4Stats: null, ga4Pages: null,
}

function clearCache() {
  Object.keys(cache).forEach((k) => { cache[k] = null })
}

export function useGoogleData() {
  const [token, setTokenState] = useState(getToken())
  const [ga4PropertyId, setGA4PropertyIdState] = useState(getGA4PropertyId())
  const [data, setData] = useState({ ...cache })
  const [loading, setLoading] = useState(false)
  const [ga4Loading, setGA4Loading] = useState(false)
  const [error, setError] = useState(null)

  const isConnected = !!token
  const hasGA4 = !!ga4PropertyId

  // Connect Google
  const connect = useCallback(() => {
    setError(null)
    requestGoogleAuth(
      (newToken) => {
        setToken(newToken)
        setTokenState(newToken)
      },
      (err) => setError(String(err))
    )
  }, [])

  // Disconnect Google
  const disconnect = useCallback(() => {
    clearToken()
    clearCache()
    setTokenState(null)
    setGA4PropertyIdState(null)
    setData({ ...cache })
    setError(null)
  }, [])

  // Select GA4 property
  const selectGA4Property = useCallback((id) => {
    storeGA4PropertyId(id)
    setGA4PropertyIdState(id)
    // clear GA4 cache so it re-fetches
    cache.ga4TrafficOverTime = null
    cache.ga4Channels = null
    cache.ga4Devices = null
    cache.ga4Stats = null
    cache.ga4Pages = null
  }, [])

  // Fetch GSC + GA4 Properties when token changes
  useEffect(() => {
    if (!token) return
    if (cache.gscKeywords && cache.ga4Properties) {
      setData({ ...cache })
      return
    }
    setLoading(true)
    setError(null)
    Promise.all([
      cache.gscKeywords ? Promise.resolve(cache.gscKeywords) : fetchGSCKeywords(),
      cache.gscOverTime ? Promise.resolve(cache.gscOverTime) : fetchGSCOverTime(),
      cache.gscPages ? Promise.resolve(cache.gscPages) : fetchGSCPages(),
      cache.ga4Properties ? Promise.resolve(cache.ga4Properties) : fetchGA4Properties(),
    ])
      .then(([keywords, overTime, pages, properties]) => {
        cache.gscKeywords = keywords
        cache.gscOverTime = overTime
        cache.gscPages = pages
        cache.ga4Properties = properties
        setData((d) => ({ ...d, gscKeywords: keywords, gscOverTime: overTime, gscPages: pages, ga4Properties: properties }))
        // Auto-select if only one GA4 property
        if (properties.length === 1 && !getGA4PropertyId()) {
          storeGA4PropertyId(properties[0].id)
          setGA4PropertyIdState(properties[0].id)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  // Fetch GA4 data when property is selected
  useEffect(() => {
    if (!token || !ga4PropertyId) return
    if (cache.ga4Stats) {
      setData((d) => ({
        ...d,
        ga4TrafficOverTime: cache.ga4TrafficOverTime,
        ga4Channels: cache.ga4Channels,
        ga4Devices: cache.ga4Devices,
        ga4Stats: cache.ga4Stats,
        ga4Pages: cache.ga4Pages,
      }))
      return
    }
    setGA4Loading(true)
    Promise.all([
      fetchGA4TrafficOverTime(ga4PropertyId),
      fetchGA4Channels(ga4PropertyId),
      fetchGA4Devices(ga4PropertyId),
      fetchGA4Stats(ga4PropertyId),
      fetchGA4Pages(ga4PropertyId),
    ])
      .then(([trafficOverTime, channels, devices, stats, pages]) => {
        cache.ga4TrafficOverTime = trafficOverTime
        cache.ga4Channels = channels
        cache.ga4Devices = devices
        cache.ga4Stats = stats
        cache.ga4Pages = pages
        setData((d) => ({
          ...d,
          ga4TrafficOverTime: trafficOverTime,
          ga4Channels: channels,
          ga4Devices: devices,
          ga4Stats: stats,
          ga4Pages: pages,
        }))
      })
      .catch((err) => setError(err.message))
      .finally(() => setGA4Loading(false))
  }, [token, ga4PropertyId])

  return {
    isConnected,
    hasGA4,
    connect,
    disconnect,
    selectGA4Property,
    ga4PropertyId,
    loading,
    ga4Loading,
    error,
    ...data,
  }
}
