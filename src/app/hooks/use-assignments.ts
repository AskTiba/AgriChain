import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAssignments,
  addAssignment,
  deleteAssignment,
} from '~/app/server/assignments'
import type { Assignment } from '~/app/db/schema'

export const ASSIGNMENTS_QUERY_KEY = ['assignments'] as const

export function useAssignments() {
  return useQuery({
    queryKey: ASSIGNMENTS_QUERY_KEY,
    queryFn: () => fetchAssignments(),
    enabled: typeof window !== 'undefined',
  })
}

export function useAddAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: {
      harvestId: string
      vehicleId: string
      driverName: string
      destination: string
    }) => addAssignment({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY })
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAssignment({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY })
    },
  })
}

export type { Assignment }
