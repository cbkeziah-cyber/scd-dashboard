import { useState, useEffect } from 'react'
import { fetchAllProducts, fetchCollections, fetchInventory, fetchAllOrders, auditProduct, computeOrderStats } from '../lib/wixApi'

const cache = { products: null, collections: null, inventory: null, orders: null, orderStats: null, promise: null }

async function loadAll() {
  if (cache.promise) return cache.promise
  cache.promise = Promise.all([
    fetchAllProducts(),
    fetchCollections(),
    fetchInventory(),
    fetchAllOrders(),
  ]).then(([products, collections, inventory, orders]) => {
    cache.products = products
    cache.collections = collections
    cache.inventory = inventory
    cache.orders = orders
    cache.orderStats = computeOrderStats(orders)
    return { products, collections, inventory, orders, orderStats: cache.orderStats }
  })
  return cache.promise
}

export function useWixData() {
  const [state, setState] = useState({
    products: cache.products,
    collections: cache.collections,
    inventory: cache.inventory,
    orders: cache.orders,
    orderStats: cache.orderStats,
    loading: !cache.products,
    error: null,
  })

  useEffect(() => {
    if (cache.products) return
    loadAll()
      .then(data => setState({ ...data, loading: false, error: null }))
      .catch(err => setState(s => ({ ...s, loading: false, error: err.message })))
  }, [])

  const audits = state.products ? state.products.map(auditProduct) : null

  return { ...state, audits }
}
