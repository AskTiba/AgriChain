export interface Order {
  id: string
  harvestId: string
  buyerId: string
  quantity: number
  status: 'pending' | 'confirmed' | 'delivered'
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'agri-tech-orders'

function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
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

export async function addOrder(
  order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const orders = getStoredOrders()
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
