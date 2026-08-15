import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchOrders, fetchOrdersByBuyer, fetchOrderByOrderNumber, addOrder, updateOrderStatus, deleteOrder, Order } from '~/app/lib/order-api'

const defaultOrders: Order[] = [
  { id: '550e8400-e29b-41d4-a716-446655440001', orderNumber: 'ORD-000001', harvestId: 'h1', buyerId: 'buyer-001', quantity: 100, status: 'pending', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '550e8400-e29b-41d4-a716-446655440002', orderNumber: 'ORD-000002', harvestId: 'h2', buyerId: 'buyer-001', quantity: 50, status: 'confirmed', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '550e8400-e29b-41d4-a716-446655440003', orderNumber: 'ORD-000003', harvestId: 'h3', buyerId: 'buyer-002', quantity: 75, status: 'delivered', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
]

function getInitialOrders(): Order[] {
  if (typeof window === 'undefined') return defaultOrders
  try {
    const stored = localStorage.getItem('agri-tech-orders')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.length > 0) {
        const hasOldFormat = parsed.some((o: Order) => !o.orderNumber || o.id.match(/^[a-z]\d$/) || o.id.length < 10)
        if (hasOldFormat) {
          localStorage.setItem('agri-tech-orders', JSON.stringify(defaultOrders))
          return defaultOrders
        }
        return parsed
      }
    }
    localStorage.setItem('agri-tech-orders', JSON.stringify(defaultOrders))
    return defaultOrders
  } catch {
    return defaultOrders
  }
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    initialData: getInitialOrders,
  })
}

export function useOrdersByBuyer(buyerId: string) {
  return useQuery({
    queryKey: ['orders', buyerId],
    queryFn: () => fetchOrdersByBuyer(buyerId),
    initialData: () => {
      const orders = getInitialOrders()
      return orders.filter((o) => o.buyerId === buyerId)
    },
  })
}

export function useOrderByOrderNumber(orderNumber: string) {
  return useQuery({
    queryKey: ['orders', orderNumber],
    queryFn: () => fetchOrderByOrderNumber(orderNumber),
    initialData: () => {
      const orders = getInitialOrders()
      return orders.find((o) => o.orderNumber === orderNumber)
    },
  })
}

export function useAddOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: addOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
