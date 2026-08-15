import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchOrders, fetchOrdersByBuyer, addOrder, updateOrderStatus, deleteOrder, Order } from '~/app/lib/order-api'

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  })
}

export function useOrdersByBuyer(buyerId: string) {
  return useQuery({
    queryKey: ['orders', buyerId],
    queryFn: () => fetchOrdersByBuyer(buyerId),
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
