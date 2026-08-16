export interface Order {
  id: string
  orderNumber: string
  harvestId: string
  buyerId: string
  quantity: number
  status: 'pending' | 'confirmed' | 'delivered'
  createdAt: string
  updatedAt: string
}

import { sampleOrders } from './seed-data'

const STORAGE_KEY = 'agri-tech-orders'

const defaultOrders = sampleOrders

function ensureValidOrders(orders: Order[]): Order[] {
  const hasOldFormat = orders.some((o) => !o.orderNumber || o.id.match(/^[a-z]\d$/) || o.id.length < 10)
  if (hasOldFormat) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOrders))
    return defaultOrders
  }
  return orders
}

function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return defaultOrders
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.length > 0) {
        return ensureValidOrders(parsed)
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOrders))
    return defaultOrders
  } catch {
    return defaultOrders
  }
}

function storeOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

export async function fetchOrders(): Promise<Order[]> {
  return getStoredOrders()
}

export async function fetchOrdersByBuyer(buyerId: string): Promise<Order[]> {
  const orders = getStoredOrders()
  return orders.filter((o) => o.buyerId === buyerId)
}

export async function fetchOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
  const orders = getStoredOrders()
  return orders.find((o) => o.orderNumber === orderNumber)
}

function generateOrderNumber(orders: Order[]): string {
  const maxNum = orders.reduce((max, o) => {
    const match = o.orderNumber?.match(/ORD-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      return num > max ? num : max
    }
    return max
  }, 0)
  return `ORD-${String(maxNum + 1).padStart(6, '0')}`
}

export async function addOrder(
  order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const orders = getStoredOrders()
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    orderNumber: generateOrderNumber(orders),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  orders.unshift(newOrder)
  storeOrders(orders)
  return newOrder
}

export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<Order> {
  const orders = getStoredOrders()
  const index = orders.findIndex((o) => o.id === id)
  if (index === -1) throw new Error('Order not found')
  
  orders[index] = {
    ...orders[index],
    status,
    updatedAt: new Date().toISOString(),
  }
  storeOrders(orders)
  return orders[index]
}

export async function deleteOrder(id: string): Promise<void> {
  const orders = getStoredOrders()
  const filtered = orders.filter((o) => o.id !== id)
  storeOrders(filtered)
}
