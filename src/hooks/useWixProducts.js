import { useState, useEffect } from 'react'
import { fetchAllProducts, fetchCollections, fetchInventory, auditProduct } from '../lib/wixApi'

// Simple shared cache so all pages share one fetch
const cache = { products: null, collections: null, inventory: null, promise: null }

async function loadAll() {
  if (cache.promise) return cache.promise
  cache.promise = Promise.all([
    fetchAllProducts(),
    fetchCollections(),
    fetchInventory(),
  ]).then(([products, collections, inventory]) => {
    cache.products = products
    cache.collections = collections
    cache.inventory = inventory
    return { products, collections, inventory }
  })
  return cache.promise
}

export function useWixData() {
  const [state, setState] = useState({
    products: cache.products,
    collections: cache.collections,
    inventory: cache.inventory,
    loading: !cache.products,
    error: null,
  })

  useEffect(() => {
    if (cache.products) return
    loadAll()
      .then(({ products, collections, inventory }) => {
        setState({ products, collections, inventory, loading: false, error: null })
      })
      .catch(err => {
        setState(s => ({ ...s, loading: false, error: err.message }))
      })
  }, [])

  const audits = state.products ? state.products.map(auditProduct) : null

  return { ...state, audits }
}
