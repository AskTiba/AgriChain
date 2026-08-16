import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWarehouses, addWarehouse, assignHarvest } from '~/app/server/warehouses'

export const WAREHOUSES_QUERY_KEY = ['warehouses'] as const

export function useWarehouses() {
  return useQuery({
    queryKey: WAREHOUSES_QUERY_KEY,
    queryFn: () => fetchWarehouses(),
    enabled: typeof window !== 'undefined',
  })
}

export function useAddWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: {
      name: string
      location: string
      totalCapacityKg: number
      cooperativeId?: string | null
    }) => addWarehouse({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WAREHOUSES_QUERY_KEY })
    },
  })
}

export function useAssignHarvest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: { harvestId: string; warehouseId: string | null }) =>
      assignHarvest({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WAREHOUSES_QUERY_KEY })
    },
  })
}
