import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchVehicles,
  addVehicle,
  deleteVehicle,
  updateVehicleStatus,
} from '~/app/server/vehicles'
import type { Vehicle } from '~/app/db/schema'

export const VEHICLES_QUERY_KEY = ['vehicles'] as const

export function useVehicles() {
  return useQuery({
    queryKey: VEHICLES_QUERY_KEY,
    queryFn: () => fetchVehicles(),
    enabled: typeof window !== 'undefined',
  })
}

export function useAddVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: {
      name: string
      type: 'truck' | 'pickup' | 'motorcycle' | 'other'
      plateNumber?: string | null
      payloadCapacity: number
    }) => addVehicle({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY })
    },
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteVehicle({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY })
    },
  })
}

export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Vehicle['status'] }) =>
      updateVehicleStatus({ data: { id, status: status as 'available' | 'in-use' | 'maintenance' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY })
    },
  })
}

export type { Vehicle }
