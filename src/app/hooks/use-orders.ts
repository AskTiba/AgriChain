import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchOrders,
  fetchOrdersByBuyer,
  fetchOrderByOrderNumber,
  addOrder,
  updateOrderStatus,
  deleteOrder,
} from '~/app/server/orders'
import type { Order } from '~/app/db/schema'

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchOrders(),
    enabled: typeof window !== 'undefined',
  })
}

export function useOrdersByBuyer(buyerId: string) {
  return useQuery({
    queryKey: ['orders', buyerId],
    queryFn: () => fetchOrdersByBuyer({ data: { buyerId } }),
    enabled: typeof window !== 'undefined',
  })
}

export function useOrderByOrderNumber(orderNumber: string) {
  return useQuery({
    queryKey: ['orders', orderNumber],
    queryFn: () => fetchOrderByOrderNumber({ data: { orderNumber } }),
    enabled: typeof window !== 'undefined',
  })
}

export function useAddOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: {
      harvestId: string
      buyerId: string
      quantity: number
    }) => addOrder({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      updateOrderStatus({ data: { id, status: status as 'pending' | 'confirmed' | 'delivered' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteOrder({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
