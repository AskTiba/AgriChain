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

const STORAGE_KEY = 'agri-tech-orders'
const SEED_VERSION_KEY = 'agri-tech-seed-version'
const CURRENT_VERSION = '4'

const defaultOrders: Order[] = [
  { id: '550e8400-e29b-41d4-a716-446655440001', orderNumber: 'ORD-000001', harvestId: 'h1', buyerId: 'buyer-001', quantity: 100, status: 'pending', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '550e8400-e29b-41d4-a716-446655440002', orderNumber: 'ORD-000002', harvestId: 'h2', buyerId: 'buyer-001', quantity: 50, status: 'confirmed', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '550e8400-e29b-41d4-a716-446655440003', orderNumber: 'ORD-000003', harvestId: 'h3', buyerId: 'buyer-002', quantity: 75, status: 'delivered', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
]

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
